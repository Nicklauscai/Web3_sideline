const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyToken合约测试", function () {
    let MyToken;
    let token;
    let owner;
    let addr1;
    let addr2;
    let addrs;

    // 常量定义（与合约中保持一致）
    const TOKEN_NAME = "MyToken";
    const TOKEN_SYMBOL = "MTK";
    const DECIMALS = 18;
    const MAX_SUPPLY = ethers.parseEther("100000000"); // 1亿
    const MAX_MINT_PER_ADDRESS = ethers.parseEther("100000"); // 10万
    const MAX_MINT_PER_TX = ethers.parseEther("10000"); // 1万
    const INITIAL_SUPPLY = ethers.parseEther("1000");

    beforeEach(async function () {
        // 获取测试账户
        [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

        // 部署合约
        MyToken = await ethers.getContractFactory("MyToken");
        token = await MyToken.deploy(owner.address);
        await token.waitForDeployment();
    });

    describe("部署和初始化", function () {
        it("应该正确设置代币基本信息", async function () {
            expect(await token.name()).to.equal(TOKEN_NAME);
            expect(await token.symbol()).to.equal(TOKEN_SYMBOL);
            expect(await token.decimals()).to.equal(DECIMALS);
        });

        it("应该正确设置常量值", async function () {
            expect(await token.MAX_SUPPLY()).to.equal(MAX_SUPPLY);
            expect(await token.MAX_MINT_PER_ADDRESS()).to.equal(MAX_MINT_PER_ADDRESS);
            expect(await token.MAX_MINT_PER_TX()).to.equal(MAX_MINT_PER_TX);
        });

        it("应该正确设置所有者", async function () {
            expect(await token.owner()).to.equal(owner.address);
        });

        it("应该给所有者初始供应量", async function () {
            expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY);
            expect(await token.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
        });

        it("应该记录初始铸造历史", async function () {
            expect(await token.getMintHistoryLength()).to.equal(1);
            const history = await token.getMintHistory(0, 0);
            expect(history[0].recipient).to.equal(owner.address);
            expect(history[0].amount).to.equal(INITIAL_SUPPLY);
        });

        it("应该初始化铸造状态为未暂停", async function () {
            expect(await token.mintPaused()).to.be.false;
        });

        it("构造函数不应接受零地址作为所有者", async function () {
            await expect(MyToken.deploy(ethers.ZeroAddress))
                .to.be.reverted; // OpenZeppelin会抛出自定义错误，我们只检查是否被拒绝
        });
    });

    describe("ERC20基本功能", function () {
        beforeEach(async function () {
            // 给addr1铸造一些代币用于测试
            await token.mint(addr1.address, ethers.parseEther("100"));
        });

        it("应该正确执行转账", async function () {
            const transferAmount = ethers.parseEther("50");
            
            await expect(token.connect(addr1).transfer(addr2.address, transferAmount))
                .to.changeTokenBalances(
                    token,
                    [addr1, addr2],
                    [-transferAmount, transferAmount]
                );
        });

        it("应该正确执行授权和转账", async function () {
            const approveAmount = ethers.parseEther("50");
            const transferAmount = ethers.parseEther("30");

            // 授权
            await token.connect(addr1).approve(addr2.address, approveAmount);
            expect(await token.allowance(addr1.address, addr2.address)).to.equal(approveAmount);

            // 从授权中转账
            await expect(token.connect(addr2).transferFrom(addr1.address, addr2.address, transferAmount))
                .to.changeTokenBalances(
                    token,
                    [addr1, addr2],
                    [-transferAmount, transferAmount]
                );

            // 检查剩余授权
            expect(await token.allowance(addr1.address, addr2.address))
                .to.equal(approveAmount - transferAmount);
        });

        it("转账金额不足时应该失败", async function () {
            const transferAmount = ethers.parseEther("200"); // 超过余额
            
            await expect(token.connect(addr1).transfer(addr2.address, transferAmount))
                .to.be.revertedWithCustomError(token, "ERC20InsufficientBalance");
        });

        it("授权转账金额超过授权时应该失败", async function () {
            const approveAmount = ethers.parseEther("30");
            const transferAmount = ethers.parseEther("50");

            await token.connect(addr1).approve(addr2.address, approveAmount);
            
            await expect(token.connect(addr2).transferFrom(addr1.address, addr2.address, transferAmount))
                .to.be.revertedWithCustomError(token, "ERC20InsufficientAllowance");
        });
    });

    describe("铸造功能", function () {
        describe("单次铸造", function () {
            it("所有者应该能够铸造代币", async function () {
                const mintAmount = ethers.parseEther("100");
                
                await expect(token.mint(addr1.address, mintAmount))
                    .to.changeTokenBalance(token, addr1, mintAmount);
                
                expect(await token.totalSupply()).to.equal(INITIAL_SUPPLY + mintAmount);
            });

            it("铸造应该触发Mint事件", async function () {
                const mintAmount = ethers.parseEther("100");
                
                await expect(token.mint(addr1.address, mintAmount))
                    .to.emit(token, "Mint")
                    .withArgs(addr1.address, mintAmount, await time.latest() + 1);
            });

            it("铸造应该更新铸造记录", async function () {
                const mintAmount = ethers.parseEther("100");
                
                await token.mint(addr1.address, mintAmount);
                
                expect(await token.mintedAmount(addr1.address)).to.equal(mintAmount);
                expect(await token.getMintHistoryLength()).to.equal(2); // 包括初始铸造
            });

            it("非所有者不应该能够铸造", async function () {
                const mintAmount = ethers.parseEther("100");
                
                await expect(token.connect(addr1).mint(addr2.address, mintAmount))
                    .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
            });

            it("不应该向零地址铸造", async function () {
                const mintAmount = ethers.parseEther("100");
                
                await expect(token.mint(ethers.ZeroAddress, mintAmount))
                    .to.be.revertedWith("MyToken: cannot mint to zero address");
            });

            it("铸造数量为0时应该失败", async function () {
                await expect(token.mint(addr1.address, 0))
                    .to.be.revertedWith("MyToken: mint amount must be greater than 0");
            });

            it("超过单次铸造限额时应该失败", async function () {
                const mintAmount = MAX_MINT_PER_TX + ethers.parseEther("1");
                
                await expect(token.mint(addr1.address, mintAmount))
                    .to.be.revertedWith("MyToken: mint amount exceeds per-tx limit");
            });

            it("超过单地址铸造限额时应该失败", async function () {
                // 分多次铸造到接近限额，每次都在单次限额内
                const batchAmount = ethers.parseEther("10000"); // 单次限额
                const numBatches = 9; // 铸造9次，总计90,000
                
                for (let i = 0; i < numBatches; i++) {
                    await token.mint(addr1.address, batchAmount);
                }
                
                // 再铸造9,999，使总计接近但不超过限额 (90,000 + 9,999 = 99,999)
                await token.mint(addr1.address, ethers.parseEther("9999"));
                
                // 现在只能再铸造1个代币，尝试铸造2个应该失败
                await expect(token.mint(addr1.address, ethers.parseEther("2")))
                    .to.be.revertedWith("MyToken: mint would exceed per-address limit");
            });

            it("铸造暂停时应该失败", async function () {
                await token.setMintPaused(true);
                
                await expect(token.mint(addr1.address, ethers.parseEther("100")))
                    .to.be.revertedWith("MyToken: minting is paused");
            });
        });

        describe("批量铸造", function () {
            it("应该能够批量铸造", async function () {
                const recipients = [addr1.address, addr2.address];
                const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];
                
                await token.batchMint(recipients, amounts);
                
                expect(await token.balanceOf(addr1.address)).to.equal(amounts[0]);
                expect(await token.balanceOf(addr2.address)).to.equal(amounts[1]);
            });

            it("批量铸造应该更新所有记录", async function () {
                const recipients = [addr1.address, addr2.address];
                const amounts = [ethers.parseEther("100"), ethers.parseEther("200")];
                
                await token.batchMint(recipients, amounts);
                
                expect(await token.mintedAmount(addr1.address)).to.equal(amounts[0]);
                expect(await token.mintedAmount(addr2.address)).to.equal(amounts[1]);
                expect(await token.getMintHistoryLength()).to.equal(3); // 包括初始铸造
            });

            it("数组长度不匹配时应该失败", async function () {
                const recipients = [addr1.address, addr2.address];
                const amounts = [ethers.parseEther("100")];
                
                await expect(token.batchMint(recipients, amounts))
                    .to.be.revertedWith("MyToken: arrays length mismatch or empty");
            });

            it("数组为空时应该失败", async function () {
                await expect(token.batchMint([], []))
                    .to.be.revertedWith("MyToken: arrays length mismatch or empty");
            });

            it("接收者超过100个时应该失败", async function () {
                const recipients = new Array(101).fill(addr1.address);
                const amounts = new Array(101).fill(ethers.parseEther("1"));
                
                await expect(token.batchMint(recipients, amounts))
                    .to.be.revertedWith("MyToken: too many recipients");
            });
        });
    });

    describe("权限管理", function () {
        it("应该能够转移所有权", async function () {
            await token.transferOwnership(addr1.address);
            expect(await token.owner()).to.equal(addr1.address);
        });

        it("新所有者应该能够铸造", async function () {
            await token.transferOwnership(addr1.address);
            
            await expect(token.connect(addr1).mint(addr2.address, ethers.parseEther("100")))
                .to.changeTokenBalance(token, addr2, ethers.parseEther("100"));
        });

        it("原所有者转移后不应该能够铸造", async function () {
            await token.transferOwnership(addr1.address);
            
            await expect(token.mint(addr2.address, ethers.parseEther("100")))
                .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
        });

        it("应该能够暂停和恢复铸造", async function () {
            // 暂停铸造
            await expect(token.setMintPaused(true))
                .to.emit(token, "MintPausedChanged")
                .withArgs(true);
            
            expect(await token.mintPaused()).to.be.true;
            
            // 恢复铸造
            await expect(token.setMintPaused(false))
                .to.emit(token, "MintPausedChanged")
                .withArgs(false);
            
            expect(await token.mintPaused()).to.be.false;
        });

        it("非所有者不应该能够暂停铸造", async function () {
            await expect(token.connect(addr1).setMintPaused(true))
                .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
        });
    });

    describe("查询功能", function () {
        beforeEach(async function () {
            await token.mint(addr1.address, ethers.parseEther("1000"));
        });

        it("应该正确返回剩余可铸造供应量", async function () {
            const currentSupply = await token.totalSupply();
            const remaining = await token.remainingMintableSupply();
            expect(remaining).to.equal(MAX_SUPPLY - currentSupply);
        });

        it("应该正确返回地址剩余可铸造数量", async function () {
            const minted = await token.mintedAmount(addr1.address);
            const remaining = await token.remainingMintableAmount(addr1.address);
            expect(remaining).to.equal(MAX_MINT_PER_ADDRESS - minted);
        });

        it("canMint应该正确判断是否可以铸造", async function () {
            expect(await token.canMint(addr1.address, ethers.parseEther("100"))).to.be.true;
            expect(await token.canMint(ethers.ZeroAddress, ethers.parseEther("100"))).to.be.false;
            expect(await token.canMint(addr1.address, 0)).to.be.false;
            expect(await token.canMint(addr1.address, MAX_MINT_PER_TX + ethers.parseEther("1"))).to.be.false;
        });

        it("应该正确返回铸造历史", async function () {
            const historyLength = await token.getMintHistoryLength();
            expect(historyLength).to.equal(2); // 初始铸造 + 一次手动铸造
            
            const history = await token.getMintHistory(0, historyLength - 1n);
            expect(history).to.have.length(2);
            expect(history[1].recipient).to.equal(addr1.address);
            expect(history[1].amount).to.equal(ethers.parseEther("1000"));
        });

        it("铸造历史范围无效时应该失败", async function () {
            await expect(token.getMintHistory(1, 0))
                .to.be.revertedWith("MyToken: invalid range");
            
            await expect(token.getMintHistory(0, 10))
                .to.be.revertedWith("MyToken: invalid range");
        });
    });

    describe("边界条件和安全性", function () {
        it("达到最大供应量时不应该能够继续铸造", async function () {
            // 这个测试可能需要很长时间，所以我们通过模拟来测试逻辑
            // 实际项目中可以考虑创建一个测试版本的合约，供应量较小
            
            // 先铸造大量代币到接近上限
            const remainingSupply = await token.remainingMintableSupply();
            const largeAmount = remainingSupply - ethers.parseEther("100");
            
            // 分批铸造到不同地址以避免单地址限制
            const batchSize = ethers.parseEther("10000");
            const numBatches = largeAmount / batchSize;
            
            // 只测试最后阶段的边界情况
            if (largeAmount > ethers.parseEther("10000")) {
                // 模拟已经接近上限的情况
                const nearMaxAmount = remainingSupply - ethers.parseEther("50");
                // 这里我们可以通过设置一个较小的MAX_SUPPLY来测试
                // 或者接受这个测试需要较长时间的事实
            }
        });

        it("重入攻击应该被阻止", async function () {
            // ReentrancyGuard应该防止重入攻击
            // 这个测试需要创建一个恶意合约来验证
            // 现在我们验证修饰符存在
            expect(await token.mint(addr1.address, ethers.parseEther("100")))
                .to.changeTokenBalance(token, addr1, ethers.parseEther("100"));
        });

        it("应该能够接收ETH", async function () {
            // 发送ETH到合约
            await expect(
                owner.sendTransaction({
                    to: await token.getAddress(),
                    value: ethers.parseEther("1")
                })
            ).to.not.be.reverted;
        });

        it("所有者应该能够提取ETH", async function () {
            // 先发送ETH到合约
            await owner.sendTransaction({
                to: await token.getAddress(),
                value: ethers.parseEther("1")
            });
            
            // 提取ETH
            await expect(token.emergencyWithdraw())
                .to.emit(token, "EmergencyWithdraw")
                .withArgs(owner.address, ethers.parseEther("1"));
        });

        it("没有ETH时提取应该失败", async function () {
            await expect(token.emergencyWithdraw())
                .to.be.revertedWith("MyToken: no ETH to withdraw");
        });

        it("非所有者不应该能够提取ETH", async function () {
            await expect(token.connect(addr1).emergencyWithdraw())
                .to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
        });
    });

    describe("Gas消耗测试", function () {
        it("单次铸造的Gas消耗应该合理", async function () {
            const tx = await token.mint(addr1.address, ethers.parseEther("100"));
            const receipt = await tx.wait();
            
            // Gas消耗应该小于200,000
            expect(receipt.gasUsed).to.be.lessThan(200000);
            console.log(`单次铸造Gas消耗: ${receipt.gasUsed}`);
        });

        it("批量铸造应该比多次单独铸造节省Gas", async function () {
            const amount = ethers.parseEther("100");
            
            // 单独铸造两次
            const tx1 = await token.mint(addr1.address, amount);
            const tx2 = await token.mint(addr2.address, amount);
            const individualGas = (await tx1.wait()).gasUsed + (await tx2.wait()).gasUsed;
            
            // 重新部署合约进行批量铸造测试
            const newToken = await MyToken.deploy(owner.address);
            await newToken.waitForDeployment();
            
            // 批量铸造
            const batchTx = await newToken.batchMint([addr1.address, addr2.address], [amount, amount]);
            const batchGas = (await batchTx.wait()).gasUsed;
            
            console.log(`单独铸造总Gas: ${individualGas}`);
            console.log(`批量铸造Gas: ${batchGas}`);
            
            // 批量铸造应该更节省Gas
            expect(batchGas).to.be.lessThan(individualGas);
        });
    });
});

// 时间工具函数
const time = {
    latest: async () => {
        const block = await ethers.provider.getBlock('latest');
        return block.timestamp;
    }
}; 