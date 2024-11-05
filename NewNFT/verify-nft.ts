import {
    findMetadataPda, 
    mplTokenMetadata,
    verifyCollectionV1} from "@metaplex-foundation/mpl-token-metadata";
import {
    airdropIfRequired,
    getExplorerLink,
    getKeypairFromFile,
} from "@solana-developers/helpers";

import {createUmi} from "@metaplex-foundation/umi-bundle-defaults";

import { clusterApiUrl, Connection, LAMPORTS_PER_SOL,} from "@solana/web3.js";
import { keypairIdentity, publicKey } from "@metaplex-foundation/umi";

const connection = new Connection(clusterApiUrl("devnet"));

const user = await getKeypairFromFile();

await airdropIfRequired(connection, user.publicKey, 1 * LAMPORTS_PER_SOL, 0.5 * LAMPORTS_PER_SOL);

console.log("Loaded User", user.publicKey.toBase58());

const umi = createUmi(connection.rpcEndpoint);
umi.use(mplTokenMetadata());

const umiUser = umi.eddsa.createKeypairFromSecretKey(user.secretKey);
umi.use(keypairIdentity(umiUser));

console.log("Set up Umi instance for user");

const collectionAddress = publicKey("B6NBqeyiijjmCBMLqqbw5PMJ7i16pKQgoG1WPkCTigwH");

const nftAddress = publicKey("Yb6XRzvWy6rDAudDC1mbbL5Z36Ce7zkTKN28R1s923p");

const transaction = await verifyCollectionV1(umi, {
    metadata: findMetadataPda(umi, {mint:nftAddress}),
    collectionMint: collectionAddress,
    authority: umiUser.identity
})

transaction.sendAndConfirm(umi);

console.log(`NFT ${nftAddress} is Verified as member of collection ${collectionAddress}! See Explorer at  ${getExplorerLink("address", nftAddress, "devnet")}`);