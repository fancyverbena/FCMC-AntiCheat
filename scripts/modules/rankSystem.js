// modules/rankSystem.js
import { world, system } from "@minecraft/server";
import { RANKS } from "../config.js";

// 以下は同じ

export class RankSystem {
    static getPlayerRank(player) {
        for (const rank of Object.values(RANKS)) {
            if (player.hasTag(rank.tag)) {
                return rank;
            }
        }
        return null;
    }

    static updatePlayerDisplay(player) {
        const rank = this.getPlayerRank(player);
        system.run(() => {
            if (rank) {
                player.nameTag = `${rank.display} ${player.name}`;
            } else {
                player.nameTag = player.name;
            }
        });
    }

    static handleRankCommand(eventData) {
        const { message, sender: player } = eventData;
        const args = message.split(" ");
        
        if (args.length < 4) {
            player.sendMessage("§c使用方法: !rank <add/remove> <プレイヤー名> <権限名>");
            return;
        }

        const action = args[1];
        const targetName = args[2];
        const rankName = args[3];

        const targetPlayer = Array.from(world.getAllPlayers()).find(p => 
            p.name.toLowerCase() === targetName.toLowerCase()
        );

        if (!targetPlayer) {
            player.sendMessage("§cプレイヤーが見つかりません");
            return;
        }

        const rank = Object.values(RANKS).find(r => 
            r.tag.toLowerCase() === `rank:${rankName.toLowerCase()}`
        );

        if (!rank) {
            player.sendMessage("§c指定された権限が見つかりません");
            return;
        }

        try {
            if (action === "add") {
                system.run(() => {
                    // 既存の権限タグを削除
                    for (const r of Object.values(RANKS)) {
                        if (targetPlayer.hasTag(r.tag)) {
                            targetPlayer.removeTag(r.tag);
                        }
                    }
                    // 新しい権限タグを追加
                    targetPlayer.addTag(rank.tag);
                    this.updatePlayerDisplay(targetPlayer);
                    player.sendMessage(`§a${targetName}に${rank.display}§aの権限を付与しました`);
                });
            } else if (action === "remove") {
                system.run(() => {
                    targetPlayer.removeTag(rank.tag);
                    this.updatePlayerDisplay(targetPlayer);
                    player.sendMessage(`§a${targetName}から${rank.display}§aの権限を削除しました`);
                });
            }
        } catch (e) {
            console.warn("Error modifying rank:", e);
            player.sendMessage("§c権限の変更中にエラーが発生しました");
        }
    }

    static initialize() {
        // スコアボード初期化
        system.run(() => {
            try {
                if (!world.scoreboard.getObjective("rank")) {
                    world.scoreboard.addObjective("rank", "権限表示");
                }
            } catch (e) {
                console.warn("Scoreboard error:", e);
            }
        });
    }
}