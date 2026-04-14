use anchor_lang::prelude::*;

declare_id!("5JNtPMMHqTdcu9SdhSitqmeK2x8QRAKhRxSo83nRBxzq");

#[program]
pub mod autofi_smart_contract {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Program initialized");
        Ok(())
    }

    pub fn execute_intent(ctx: Context<ExecuteIntent>, intent: Intent, strategy: Strategy) -> Result<()> {
        msg!("Executing AutoFi intent");

        msg!("User: {:?}", ctx.accounts.user.key());

        msg!("Goal: {}", intent.goal);
        msg!("Amount: {}", intent.amount);

        msg!("Executing strategy...");

        for step in strategy.steps.iter() {
            msg!("Step: {}", step);
        }

        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct Strategy {
    pub steps: Vec<String>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct Intent {
    pub goal: String,
    pub amount: u64,
}

#[derive(Accounts)]
pub struct ExecuteIntent<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
}

#[derive(Accounts)]
pub struct Initialize {}
