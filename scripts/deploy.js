const hre = require("hardhat")
const { items } = require("../src/items.json")

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

async function main() {
    const [deployer] = await ethers.getSigners()

    const Blockforme = await hre.ethers.getContractFactory("Blockforme")
    const blockforme = await Blockforme.deploy()
    console.log("Deploying the Blockforme contract...")
    await blockforme.deployed()
    console.log(`Deployed Blockforme Contract at: ${blockforme.address}\n`)

    for (let i = 0; i < items.length; i++) {
        const transaction = await blockforme.connect(deployer).listProducts(
            items[i].id,
            items[i].name,
            items[i].category,
            items[i].image,
            tokens(items[i].price),
            items[i].rating,
            items[i].stock,
        )

        await transaction.wait()

        console.log(`Listed item ${items[i].id}: ${items[i].name}`)
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});