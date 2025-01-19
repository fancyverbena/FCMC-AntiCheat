import { world, system } from "@minecraft/server";
import { BANNED_ITEMS, RANKS } from "../config.js";
import { RankSystem } from "./rankSystem.js";

export class AntiCheat {
    static checkBannedItems(player) {
        const rank = RankSystem.getPlayerRank(player);
        if (!rank) return; // ランクがない場合はチェックをスキップ

        // supervisor, director, developerは除外
        const excludedRanks = ["rank:supervisor", "rank:director", "rank:developer", "rank:builder", "rank:moderator"];
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

            const bannedItem = BANNED_ITEMS.find(banned => banned.itemId === item.typeId);
            if (bannedItem) {
                this.handleBannedItem(player, bannedItem, item, i);
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
                             `§7ID: §f${bannedItem.itemId}\n` +
                             `§7個数: §f${item.amount}`;

        world.sendMessage(warningMessage);
    }
}