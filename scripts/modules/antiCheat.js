import { world, system } from "@minecraft/server";
import { BANNED_ITEMS, SPECIAL_BANNED_PATTERNS, RANKS } from "../config.js";
import { RankSystem } from "./rankSystem.js";

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

        for (let i = 0; i < container.size; i++) {
            const item = container.getItem(i);
            if (!item) continue;

            // 通常の禁止アイテムチェック
            const bannedItem = BANNED_ITEMS.find(banned => banned.itemId === item.typeId);
            if (bannedItem) {
                this.handleBannedItem(player, bannedItem, item, i);
                continue;
            }

            // 特別なパターンチェック
            const specialBanned = SPECIAL_BANNED_PATTERNS.find(pattern => 
                pattern.check(item.typeId)
            );
            if (specialBanned) {
                this.handleBannedItem(player, {
                    displayName: specialBanned.displayName,
                    itemId: item.typeId
                }, item, i);
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

        // 音を鳴らす
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
}