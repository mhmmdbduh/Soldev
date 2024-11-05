use anchor_lang::prelude::*;

#[accounts]
#[derive(InitSpace)]
pub struct Offer {
    pub id: u64,
    pub maker: Pubkey,
    pub token_mint_a: Pubkey,
    pub token_mint_b: Pubkey,
    token_b_wanted_amount: u64,
    pub bump: u8,
}