const { expect } = require("chai")
// const {ethers} = require("hardhat");

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

// Global constants for listing an item
const ID = 1
const NAME = "Shoes"
const CATEGORY = "Clothing"
const IMAGE = "https://ipfs.io/ipfs/QmTYEboq8raiBs7GTUg2yLXB3PMz6HuBNgNfSZBx5Msztg/shoes.jpg"
const COST = tokens(1)
const RATING = 4
const STOCK = 5


describe("Blockforme", () => {
    let blockforme
    let deployer
    let buyer

    beforeEach(async () => {
        [deployer, buyer] = await ethers.getSigners()

        const Blockforme = await ethers.getContractFactory("Blockforme");
        blockforme = await Blockforme.deploy()
    })

    describe("Deploying", () => {
        it("Should set the owner in Blockforme", async () => {
            expect(await blockforme.owner()).to.equal(deployer.address)
        })
    })

    describe("Listing", () => {
        let transaction

        beforeEach(async () => {
            transaction = await blockforme.connect(deployer).listProducts(
                ID,
                NAME,
                CATEGORY,
                IMAGE,
                COST,
                RATING,
                STOCK
            )
            await transaction.wait()
        })

        it("Should return item attributes", async () => {
            const newItem = await blockforme.items(ID)
            expect(newItem.id).to.equal(ID)
            expect(newItem.name).to.equal(NAME)
            expect(newItem.category).to.equal(CATEGORY)
            expect(newItem.image).to.equal(IMAGE)
            expect(newItem.cost).to.equal(COST)
            expect(newItem.rating).to.equal(RATING)
            expect(newItem.stock).to.equal(STOCK)
        })

        it("Should emit a ListItems event", async () => {
            expect(transaction).to.emit(blockforme, "ListItems");
        })
    })

    describe("Purchasing", () => {
        let transaction

        beforeEach(async () => {
            transaction = await blockforme.connect(deployer).listProducts(
                ID,
                NAME,
                CATEGORY,
                IMAGE,
                COST,
                RATING,
                STOCK
            )
            await transaction.wait()

            transaction = await blockforme.connect(buyer).buyProducts(ID, { value: COST })
        })

        it("Should have enough ether to buy item", async () => {
            const result = await ethers.provider.getBalance(buyer.address)
            expect(result).to.greaterThanOrEqual(COST)
        })

        it("Should be in stock", async () => {
            expect(STOCK).to.greaterThan(0)
        })

        it("Should update the buyer's order count", async () => {
            const result = await blockforme.orderCount(buyer.address)
            expect(result).to.equal(1)
        })

        it("Should add to the order", async () => {
            const order = await blockforme.orders(buyer.address, 1)
            expect(order.time).to.be.greaterThan(0)
            expect(order.item.name).to.be.equal(NAME)
        })

        it("Should emit a purchase event", async () => {
            expect(transaction).to.emit(blockforme, "Purchase")
        })
    })

    describe("Withdrawing", () => {
        let balancebefore
        let transaction

        beforeEach(async () => {
            // List an item
            transaction = await blockforme.connect(deployer).listProducts(
                ID,
                NAME,
                CATEGORY,
                IMAGE,
                COST,
                RATING,
                STOCK
            )
            await transaction.wait()

            transaction = await blockforme.connect(buyer).buyProducts(ID, { value: COST })

            balancebefore = await ethers.provider.getBalance(buyer.address)

            transaction = await blockforme.connect(deployer).withdrawFunds()
            await transaction.wait()
        })

        it("Should update the owner's balance", async () => {
            const balanceAfter = await ethers.provider.getBalance(deployer.address)
            expect(balanceAfter).to.be.greaterThan(balancebefore)
        })

        it("Should update the contract balance", async () => {
            const result = await ethers.provider.getBalance(blockforme.address)
            expect(result).to.equal(0)
        })
    })
})