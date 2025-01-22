import { world, system } from "@minecraft/server";
import { MAX_ENCHANT_LEVELS, INCOMPATIBLE_ENCHANTS } from "../config.js";

export class EnchantChecker {
    static checkOverEnchanted(item) {
        if (!item) return null;

        const enchants = item.getComponent("enchantments");
        if (!enchants) return null;

        const enchantList = enchants.enchantments;
        const violations = [];

        // レベルチェック
        for (const [enchantType, level] of Object.entries(enchantList)) {
            const maxLevel = MAX_ENCHANT_LEVELS[enchantType];
            if (maxLevel && level > maxLevel) {
                violations.push({
                    type: "over_level",
                    enchant: enchantType,
                    current: level,
                    max: maxLevel
                });
            }
        }

        // 互換性のないエンチャントの組み合わせチェック
        const currentEnchants = Object.keys(enchantList);
        for (const incompatGroup of INCOMPATIBLE_ENCHANTS) {
            const found = incompatGroup.filter(ench => 
                currentEnchants.includes(ench)
            );
            if (found.length > 1) {
                violations.push({
                    type: "incompatible",
                    enchants: found
                });
            }
        }

        return violations.length > 0 ? violations : null;
    }

    static formatEnchantName(enchant) {
        return enchant
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    static getViolationMessage(violations, itemName) {
        let message = [];
        for (const violation of violations) {
            if (violation.type === "over_level") {
                message.push(
                    `§7- ${this.formatEnchantName(violation.enchant)}: ` +
                    `§cLv.${violation.current} §7(最大: Lv.${violation.max})`
                );
            } else if (violation.type === "incompatible") {
                message.push(
                    `§7- 互換性のない組み合わせ: §c` +
                    violation.enchants.map(e => this.formatEnchantName(e)).join('§7, §c')
                );
            }
        }
        return message;
    }
}