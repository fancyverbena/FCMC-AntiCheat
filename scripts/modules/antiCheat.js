import { world, system } from "@minecraft/server";
import { BANNED_ITEMS, SPECIAL_BANNED_PATTERNS, RANKS } from "../config.js";
import { RankSystem } from "./rankSystem.js";
import { EnchantChecker } from "./enchantChecker.js";

export class AntiCheat {
    static checkBannedItems(player) {
        const rank = RankSystem.getPlayerRank(player);
        if (!rank) return;

        const excludedRanks = ["rank:supervisor", "rank:director", "rank:developer"];
        if (excludedRanks.includes(rank.tag)) {
            return;
        }

        const inventory = player.getComponent("inventory");
        if (!inventory) return;

        const container = inventory.container;
        if (!container) return;

        // インベントリ内の各スロットをチェック
        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item) continue;

            // 通常の禁止アイテムチェック
            const bannedItem = BANNED_ITEMS.find(banned => banned.itemId === item.typeId);
            if (bannedItem) {
                this.handleBannedItem(player, bannedItem, item, i);
                continue;
            }

            // 特別なパターンチェック（ライトブロック、スポーンエッグなど）
            const specialBanned = SPECIAL_BANNED_PATTERNS.find(pattern => 
                pattern.check(item.typeId)
            );
            if (specialBanned) {
                const displayName = specialBanned.getDisplayName 
                    ? specialBanned.getDisplayName(item.typeId)
                    : specialBanned.displayName;

                this.handleBannedItem(player, {
                    displayName: displayName,
                    itemId: item.typeId
                }, item, i);
                continue;
            }

            // オーバーエンチャントチェック
            const enchantViolations = EnchantChecker.checkOverEnchanted(item);
            if (enchantViolations) {
                this.handleOverEnchanted(player, item, enchantViolations, i);
            }
        }

        // 装備スロットのチェック
        const equipment = player.getComponent("equippable");
        if (equipment) {
            const slots = [
                "head",
                "chest",
                "legs",
                "feet",
                "mainhand",
                "offhand"
            ];

            for (const slot of slots) {
                const item = equipment.getEquipment(slot);
                if (!item) continue;

                // 装備品の禁止アイテムチェック
                const bannedItem = BANNED_ITEMS.find(banned => banned.itemId === item.typeId);
                if (bannedItem) {
                    this.handleBannedEquipment(player, bannedItem, item, slot);
                    continue;
                }

                // 装備品の特別なパターンチェック
                const specialBanned = SPECIAL_BANNED_PATTERNS.find(pattern => 
                    pattern.check(item.typeId)
                );
                if (specialBanned) {
                    const displayName = specialBanned.getDisplayName 
                        ? specialBanned.getDisplayName(item.typeId)
                        : specialBanned.displayName;

                    this.handleBannedEquipment(player, {
                        displayName: displayName,
                        itemId: item.typeId
                    }, item, slot);
                    continue;
                }

                // 装備品のオーバーエンチャントチェック
                const enchantViolations = EnchantChecker.checkOverEnchanted(item);
                if (enchantViolations) {
                    this.handleOverEnchantedEquipment(player, item, enchantViolations, slot);
                }
            }
        }
    }

    static handleBannedItem(player, bannedItem, item, slot) {
        // アイテムを削除
        const inventory = player.getComponent("inventory");
        if (inventory && inventory.container) {
            system.run(() => {
                inventory.container.setItem(slot, undefined);
            });
        }

        // 警告音を鳴らす
        player.playSound("note.bass", {
            pitch: 1.0,
            volume: 1.0
        });

        // 警告メッセージを送信
        const warningMessage = `§c[FCMC-AntiCheat] §f${player.name}が禁止アイテムを所持しました\n` +
                             `§7アイテム: §f${bannedItem.displayName}\n` +
                             `§7ID: §f${item.typeId}\n` +
                             `§7個数: §f${item.amount}`;

        world.sendMessage(warningMessage);
    }

    static handleBannedEquipment(player, bannedItem, item, slot) {
        // 装備を削除
        const equipment = player.getComponent("equippable");
        if (equipment) {
            system.run(() => {
                equipment.setEquipment(slot, undefined);
            });
        }

        // 警告音を鳴らす
        player.playSound("note.bass", {
            pitch: 1.0,
            volume: 1.0
        });

        // 警告メッセージを送信
        const warningMessage = `§c[FCMC-AntiCheat] §f${player.name}が禁止アイテムを装備しました\n` +
                             `§7アイテム: §f${bannedItem.displayName}\n` +
                             `§7ID: §f${item.typeId}\n` +
                             `§7スロット: §f${slot}`;

        world.sendMessage(warningMessage);
    }

    static handleOverEnchanted(player, item, violations, slot) {
        // アイテムを削除
        const inventory = player.getComponent("inventory");
        if (inventory && inventory.container) {
            system.run(() => {
                inventory.container.setItem(slot, undefined);
            });
        }

        // 警告音を鳴らす
        player.playSound("note.bass", {
            pitch: 1.0,
            volume: 1.0
        });

        // 違反メッセージの生成
        const violationDetails = EnchantChecker.getViolationMessage(violations, item.typeId);
        
        // 警告メッセージを送信
        const warningMessage = `§c[FCMC-AntiCheat] §f${player.name}が不正なエンチャントのアイテムを所持しました\n` +
                             `§7アイテム: §f${item.typeId}\n` +
                             `§7違反内容:\n${violationDetails.join('\n')}`;

        world.sendMessage(warningMessage);
    }

    static handleOverEnchantedEquipment(player, item, violations, slot) {
        // 装備を削除
        const equipment = player.getComponent("equippable");
        if (equipment) {
            system.run(() => {
                equipment.setEquipment(slot, undefined);
            });
        }

        // 警告音を鳴らす
        player.playSound("note.bass", {
            pitch: 1.0,
            volume: 1.0
        });

        // 違反メッセージの生成
        const violationDetails = EnchantChecker.getViolationMessage(violations, item.typeId);
        
        // 警告メッセージを送信
        const warningMessage = `§c[FCMC-AntiCheat] §f${player.name}が不正なエンチャントのアイテムを装備しました\n` +
                             `§7アイテム: §f${item.typeId}\n` +
                             `§7スロット: §f${slot}\n` +
                             `§7違反内容:\n${violationDetails.join('\n')}`;

        world.sendMessage(warningMessage);
    }

    static initialize() {
        // 定期的なチェックを開始
        system.runInterval(() => {
            for (const player of world.getAllPlayers()) {
                this.checkBannedItems(player);
            }
        }, 20); // 1秒ごとにチェック
    }
}