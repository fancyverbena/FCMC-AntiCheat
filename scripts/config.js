export const RANKS = {
    SUPERVISOR: {
        tag: "rank:supervisor",
        display: "§c[サーバー監督]"
    },
    DIRECTOR: {
        tag: "rank:director",
        display: "§4[統括]",
    },
    BUILDER: {
        tag: "rank:builder",
        display: "§9[ビルダー]",
    },
    DEVELOPER: {
        tag: "rank:developer",
        display: "§b[システム開発者]",
    },
    MODERATOR: {
        tag: "rank:moderator",
        display: "§5[違反者対処]",
    },
    TEMPORARY: {
        tag: "rank:temporary",
        display: "§a[臨時権限者]",
    }
};

export const BANNED_ITEMS = [
    {
        itemId: "minecraft:command_block",
        displayName: "コマンドブロック"
    },
    {
        itemId: "minecraft:chain_command_block",
        displayName: "チェーンコマンドブロック"
    },
    {
        itemId: "minecraft:repeating_command_block",
        displayName: "リピートコマンドブロック"
    },
    {
        itemId: "minecraft:structure_block",
        displayName: "ストラクチャーブロック"
    },
    {
        itemId: "minecraft:structure_void",
        displayName: "ストラクチャーヴォイド"
    },
    {
        itemId: "minecraft:command_block_minecart",
        displayName: "コマンドブロック付きトロッコ"
    },
    {
        itemId: "minecraft:barrier",
        displayName: "バリアブロック"
    },
    {
        itemId: "minecraft:border_block",
        displayName: "ボーダーブロック"
    },
    {
        itemId: "minecraft:deny",
        displayName: "拒否ブロック"
    },
    {
        itemId: "minecraft:allow",
        displayName: "許可ブロック"
    },
    {
        itemId: "minecraft:flowing_lava",
        displayName: "溶岩流"
    },
    {
        itemId: "minecraft:lava",
        displayName: "溶岩"
    },
    {
        itemId: "minecraft:flowing_water",
        displayName: "水流"
    },
    {
        itemId: "minecraft:water",
        displayName: "水"
    },
    {
        itemId: "minecraft:air",
        displayName: "空気"
    },
    {
        itemId: "minecraft:lodestone_compass",
        displayName: "ロードストーンコンパス"
    },
    {
        itemId: "minecraft:water_bucket",
        displayName: "水バケツ"
    },
    {
        itemId: "minecraft:lava_bucket",
        displayName: "溶岩バケツ"
    },
    {
        itemId: "minecraft:tnt",
        displayName: "TNTブロック"
    }
];

export const SPECIAL_BANNED_PATTERNS = [
    {
        pattern: "minecraft:light_block_",
        displayName: "ライトブロック",
        check: (itemId) => itemId.startsWith("minecraft:light_block_")
    },
    {
        pattern: "minecraft:*_spawn_egg",
        displayName: "スポーンエッグ",
        check: (itemId) => itemId.endsWith("_spawn_egg"),
        // スポーンエッグの場合、具体的なMobの名前を表示するための追加処理
        getDisplayName: (itemId) => {
            const mobName = itemId
                .replace("minecraft:", "")
                .replace("_spawn_egg", "")
                .split("_")
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ");
            return `${mobName} のスポーンエッグ`;
        }
    }
];