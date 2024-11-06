pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("BQV3YAPL7849YpcAbSypg2CfBCofMf2oZQhRXT4wjjWe");

#[program]
pub mod swap {
    use super::*;

    pub fn make_offer(context: Context<MakeOffer>) -> Result<()> {
        instructions::make_offer::send_offered_tokens_to_vault()?;

        instructions::make_offer::save_offer()

        
    }
}
