use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("51HEFeJUbmRSwsnU66UZPSfwSM7WZTfpdj28DW3Ezwc4");

#[program]
pub mod autofi_smart_contract {
    use super::*;

    /// Creates a new vault PDA for the user.
    pub fn create_vault(
        ctx: Context<CreateVault>,
        goal: String,
        strategy: String,
        apy: u8,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.user.key();
        vault.goal = goal;
        vault.strategy = strategy;
        vault.apy = apy;
        vault.amount_lamports = 0;
        vault.deployed_at = Clock::get()?.unix_timestamp;
        vault.bump = ctx.bumps.vault;

        msg!("Vault created for user: {:?}", vault.owner);
        Ok(())
    }

    /// Initializes the global Yield Pool.
    pub fn initialize_yield_pool(ctx: Context<InitializeYieldPool>) -> Result<()> {
        let yield_pool = &mut ctx.accounts.yield_pool;
        yield_pool.bump = ctx.bumps.yield_pool;
        msg!("Yield Pool Initialized");
        Ok(())
    }

    /// Deposits SOL from user wallet into the vault PDA.
    pub fn deposit_sol(ctx: Context<DepositSol>, amount_lamports: u64) -> Result<()> {
        require!(amount_lamports > 0, AutoFiError::ZeroAmount);

        // Transfer SOL from user to vault PDA
        system_program::transfer(
            CpiContext::new(
                ctx.accounts.system_program.to_account_info(),
                system_program::Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                },
            ),
            amount_lamports,
        )?;

        let vault = &mut ctx.accounts.vault;
        vault.amount_lamports = vault
            .amount_lamports
            .checked_add(amount_lamports)
            .ok_or(AutoFiError::Overflow)?;

        msg!(
            "Deposited {} lamports into vault. Total: {}",
            amount_lamports,
            vault.amount_lamports
        );
        Ok(())
    }

    /// Withdraws SOL from the vault PDA back to the user wallet, including accrued interest.
    pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount_lamports: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        let yield_pool = &mut ctx.accounts.yield_pool;

        require!(amount_lamports > 0, AutoFiError::ZeroAmount);
        require!(
            vault.amount_lamports >= amount_lamports,
            AutoFiError::InsufficientFunds
        );

        // 1. Calculate Interest
        let current_time = Clock::get()?.unix_timestamp;
        let time_elapsed = current_time.saturating_sub(vault.deployed_at);
        
        // APY from vault state. Formula: Principal * apy% * (time_elapsed / SECONDS_IN_YEAR)
        // 31,536,000 seconds in a year
        let apy: u128 = vault.apy as u128;
        let seconds_in_year: u128 = 31_536_000;
        let principal = amount_lamports as u128;
        
        let interest_lamports_u128 = principal
            .checked_mul(apy).unwrap_or(0)
            .checked_mul(time_elapsed as u128).unwrap_or(0)
            .checked_div(100).unwrap_or(0)
            .checked_div(seconds_in_year).unwrap_or(0);
            
        let interest_lamports = interest_lamports_u128 as u64;

        // Ensure Yield Pool has enough funds for interest
        let yield_pool_balance = **yield_pool.to_account_info().lamports.borrow();
        // Rent exempt minimum for Yield Pool (approx 0.001 SOL, but let's be safe and check if it has more than interest)
        require!(
            yield_pool_balance > interest_lamports,
            AutoFiError::InsufficientYieldPoolFunds
        );

        // 2. Transfer Principal from Vault to User
        let vault_info = vault.to_account_info();
        let user_info = ctx.accounts.user.to_account_info();

        **vault_info.try_borrow_mut_lamports()? -= amount_lamports;
        **user_info.try_borrow_mut_lamports()? += amount_lamports;

        vault.amount_lamports = vault
            .amount_lamports
            .checked_sub(amount_lamports)
            .ok_or(AutoFiError::Overflow)?;

        // 3. Transfer Interest from Yield Pool to User
        if interest_lamports > 0 {
            let yield_pool_info = yield_pool.to_account_info();
            **yield_pool_info.try_borrow_mut_lamports()? -= interest_lamports;
            **user_info.try_borrow_mut_lamports()? += interest_lamports;
            msg!("Accrued Interest Paid: {} lamports", interest_lamports);
        }

        msg!(
            "Withdrew {} principal lamports from vault. Remaining: {}",
            amount_lamports,
            vault.amount_lamports
        );
        Ok(())
    }
}

/* ── Accounts ── */

#[derive(Accounts)]
pub struct CreateVault<'info> {
    #[account(
        init,
        payer = user,
        space = 8 + VaultAccount::INIT_SPACE,
        seeds = [b"vault", user.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, VaultAccount>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DepositSol<'info> {
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = vault.bump,
        has_one = owner @ AutoFiError::Unauthorized,
    )]
    pub vault: Account<'info, VaultAccount>,

    #[account(mut, constraint = user.key() == vault.owner @ AutoFiError::Unauthorized)]
    pub user: Signer<'info>,

    /// CHECK: owner field validation
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct WithdrawSol<'info> {
    #[account(
        mut,
        seeds = [b"vault", user.key().as_ref()],
        bump = vault.bump,
        has_one = owner @ AutoFiError::Unauthorized,
    )]
    pub vault: Account<'info, VaultAccount>,

    #[account(
        mut,
        seeds = [b"yield_pool"],
        bump = yield_pool.bump,
    )]
    pub yield_pool: Account<'info, YieldPool>,

    #[account(mut, constraint = user.key() == vault.owner @ AutoFiError::Unauthorized)]
    pub user: Signer<'info>,

    /// CHECK: owner field validation
    pub owner: AccountInfo<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct InitializeYieldPool<'info> {
    #[account(
        init,
        payer = admin,
        space = 8 + YieldPool::INIT_SPACE,
        seeds = [b"yield_pool"],
        bump,
    )]
    pub yield_pool: Account<'info, YieldPool>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

/* ── State ── */

#[account]
#[derive(InitSpace)]
pub struct VaultAccount {
    pub owner: Pubkey,          // 32
    #[max_len(32)]
    pub goal: String,           // 4 + 32
    #[max_len(64)]
    pub strategy: String,       // 4 + 64
    pub amount_lamports: u64,   // 8
    pub apy: u8,                // 1
    pub deployed_at: i64,       // 8
    pub bump: u8,               // 1
}

#[account]
#[derive(InitSpace)]
pub struct YieldPool {
    pub bump: u8,               // 1
}

/* ── Errors ── */

#[error_code]
pub enum AutoFiError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Insufficient funds in vault")]
    InsufficientFunds,
    #[msg("Unauthorized: you are not the vault owner")]
    Unauthorized,
    #[msg("Arithmetic overflow")]
    Overflow,
    #[msg("Yield Pool has insufficient funds to pay interest")]
    InsufficientYieldPoolFunds,
}
