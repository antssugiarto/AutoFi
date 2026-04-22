use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("EsKBbaZGoCfTyoMKwsnR8bpPUyKXsTMoY4YRCNUffnfi");

#[program]
pub mod autofi_smart_contract {
    use super::*;

    /// Creates a new vault PDA for the user.
    pub fn create_vault(
        ctx: Context<CreateVault>,
        goal: String,
        strategy: String,
    ) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.owner = ctx.accounts.user.key();
        vault.goal = goal;
        vault.strategy = strategy;
        vault.amount_lamports = 0;
        vault.deployed_at = Clock::get()?.unix_timestamp;
        vault.bump = ctx.bumps.vault;

        msg!("Vault created for user: {:?}", vault.owner);
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

    /// Withdraws SOL from the vault PDA back to the user wallet.
    pub fn withdraw_sol(ctx: Context<WithdrawSol>, amount_lamports: u64) -> Result<()> {
        let vault = &mut ctx.accounts.vault;

        require!(amount_lamports > 0, AutoFiError::ZeroAmount);
        require!(
            vault.amount_lamports >= amount_lamports,
            AutoFiError::InsufficientFunds
        );

        // Transfer SOL from vault PDA back to user
        // For PDA-owned accounts we must use direct lamport manipulation
        let vault_info = vault.to_account_info();
        let user_info = ctx.accounts.user.to_account_info();

        **vault_info.try_borrow_mut_lamports()? -= amount_lamports;
        **user_info.try_borrow_mut_lamports()? += amount_lamports;

        vault.amount_lamports = vault
            .amount_lamports
            .checked_sub(amount_lamports)
            .ok_or(AutoFiError::Overflow)?;

        msg!(
            "Withdrew {} lamports from vault. Remaining: {}",
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

    #[account(mut, constraint = user.key() == vault.owner @ AutoFiError::Unauthorized)]
    pub user: Signer<'info>,

    /// CHECK: owner field validation
    pub owner: AccountInfo<'info>,

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
    pub deployed_at: i64,       // 8
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
}
