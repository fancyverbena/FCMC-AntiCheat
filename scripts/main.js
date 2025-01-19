import { world, system } from "@minecraft/server";
import { RankSystem } from "./modules/rankSystem.js";
import { AntiCheat } from "./modules/antiCheat.js";

// ランクシステムの初期化
RankSystem.initialize();

// チャットイベント処理
world.beforeEvents.chatSend.subscribe((eventData) => {
    const { message, sender: player } = eventData;
    
    if (message.startsWith("!rank")) {
        eventData.cancel = true;
        RankSystem.handleRankCommand(eventData);
    } else {
        // チャットメッセージをキャンセルして新しいメッセージを送信
        eventData.cancel = true;
        const rank = RankSystem.getPlayerRank(player);
        const prefix = rank ? rank.display : "";
        world.sendMessage(`${prefix} ${player.name}: ${message}`);
    }
});

// プレイヤー参加時の処理
world.afterEvents.playerSpawn.subscribe((eventData) => {
    const player = eventData.player;
    system.runTimeout(() => {
        RankSystem.updatePlayerDisplay(player);
    }, 20);
});

// 定期的な更新処理（1秒ごと）
system.runInterval(() => {
    for (const player of world.getAllPlayers()) {
        RankSystem.updatePlayerDisplay(player);
        AntiCheat.checkBannedItems(player);
    }
}, 20);