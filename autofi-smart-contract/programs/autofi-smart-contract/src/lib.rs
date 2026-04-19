use anchor_lang::prelude::*;

declare_id!("");

#[program]
pub mod autofi_smart_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Program initialized");
        Ok(())
    }

    pub fn execute_intent(ctx: Context<ExecuteIntent>, goal: String,
    amount: u64,) -> Result<()> {
        msg!("Executing AutoFi intent");

        msg!("User: {:?}", ctx.accounts.user.key());

        msg!("Goal: {}", goal);
        msg!("Amount: {}", amount);

        Ok(())
    }
}

#[derive(Accounts)]
pub struct ExecuteIntent<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct Initialize {}
