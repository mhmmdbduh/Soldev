import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BanksClient, ProgramTestContext, startAnchor } from "solana-bankrun";
import { mintTo, createMint } from "spl-token-bankrun";


import IDL from "../target/idl/vesting.json";
import { SYSTEM_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/native/system";
import { BankrunProvider } from "anchor-bankrun";
import { BN, Program } from "@coral-xyz/anchor";
import { Vesting } from "@project/anchor";
import NodeWallet from "@coral-xyz/anchor/dist/cjs/nodewallet";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

describe("Vesting Smart Contract Test", () => {
    const companyName = "Abduh Holdings"
    let beneficiary: Keypair;
    let context: ProgramTestContext;
    let provider: BankrunProvider; 
    let program: anchor.Program<Vesting>;
    let banksClient: BanksClient;
    let employer: Keypair;
    let mint: PublicKey;
    let beneficiaryProvider: BankrunProvider;
    let program2: Program<Vesting>; 
    let vestingAccountKey: PublicKey;
    let treasuryTokenAccount: PublicKey;
    let employeeAccount: PublicKey;

    beforeAll ( async () => {
        beneficiary = new anchor.web3.Keypair();

        context = await startAnchor(
            "",
            [ {name: "vesting", programId: new PublicKey(IDL.address)},
        ],
    [
        {
            address: beneficiary.publicKey,
            info: {
                lamports: 1000_000_000,
                data: Buffer.alloc(0),
                owner: SYSTEM_PROGRAM_ID,
                executable: false,
            }
        }
    ])
    
        provider = new BankrunProvider(context);

        anchor.setProvider(provider);

        program = new Program<Vesting>(IDL as Vesting, provider),

        banksClient = context.banksClient;

        employer = provider.wallet.payer;
    
        //@ts-ignore
        mint = await createMint(banksClient, employer, employer.publicKey, null, 2)

        beneficiaryProvider = new BankrunProvider(context);
        beneficiaryProvider.wallet = new NodeWallet(beneficiary);

        program2 = new Program<Vesting>(IDL as Vesting, beneficiaryProvider);

        [vestingAccountKey] = PublicKey.findProgramAddressSync(
            [Buffer.from(companyName)],
            program.programId
        );

        [treasuryTokenAccount] = PublicKey.findProgramAddressSync(
            [Buffer.from("vesting_treasury"), Buffer.from(companyName)],
            program.programId
        );

        [employeeAccount] = PublicKey.findProgramAddressSync(
            [
                Buffer.from("employee_vesting"),
                beneficiary.publicKey.toBuffer(),
                vestingAccountKey.toBuffer(),
            ],
            program.programId
        );

    });

    it("should create a vesting account", async () => {
        const tx = await program.methods.createVestingAccount(companyName).accounts({
            signer: employer.publicKey,
            mint,
            tokenProgram: TOKEN_PROGRAM_ID,
        }).rpc({commitment: "confirmed"});

        const vestingAccountData = await program.account.vestingAccount.fetch(vestingAccountKey, "confirmed");
        console.log("Vesting Account Data: ", vestingAccountData, null,2);
        console.log("Create Vesting Account: ", tx)
    })
    it("should fund the treasury token account", async () => {
        const amount = 10_000 * 10 ** 9;
        const tx = await mintTo(
            //@ts-ignore
            banksClient,
            employer,
            mint,
            treasuryTokenAccount,
            employer,
            amount,

        );
    })

    it("should creating employee vesting account", async () => {
        const tx2 = program.methods.createEmployeeAccount(
            new BN(0),
            new BN(100), 
            new BN(100), 
            new BN(0),
        ).accounts({
            beneficiary: beneficiary.publicKey,
            vestingAccount: vestingAccountKey,
        }).rpc({commitment: "confirmed", skipPreflight: true});

        console.log("Create Employee Account Tx: ", tx2);
        console.log("Employee Account: ", employeeAccount.toBase58());
        
    })
});