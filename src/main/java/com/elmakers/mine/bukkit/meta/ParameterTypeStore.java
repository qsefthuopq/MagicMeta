package com.elmakers.mine.bukkit.meta;

import java.util.HashMap;
import java.util.Map;

import javax.annotation.Nonnull;

import org.bukkit.Effect;
import org.bukkit.FireworkEffect;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.block.Biome;
import org.bukkit.entity.EntityType;
import org.bukkit.util.Vector;
import com.elmakers.mine.bukkit.magic.SourceLocation;
import com.elmakers.mine.bukkit.slikey.effectlib.util.ParticleEffect;
import com.google.common.base.CaseFormat;

public class ParameterTypeStore {
    private final Map<String, ParameterType> typeMap = new HashMap<>();

    public ParameterType getParameterType(@Nonnull Class<?> classType) {
        String key = CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_UNDERSCORE, classType.getSimpleName());
        return getParameterType(key, classType);
    }

    public ParameterType getParameterType(@Nonnull String key, @Nonnull Class<?> classType) {
        ParameterType parameterType = typeMap.get(key);
        if (parameterType == null) {
            parameterType = new ParameterType(key, classType);
            typeMap.put(key, parameterType);
        }

        return parameterType;
    }

    public Map<String, ParameterType> getTypes() {
        return typeMap;
    }

    public void update() {
        for (ParameterType parameterType : typeMap.values()) {
            parameterType.update();
        }
    }

    public Parameter getParameter(String key, Class<?> defaultClass) {
        // Easier to do this here then fill it in by hand
        ParameterType parameterType;
        switch (key) {
            case "add_effects":
            case "remove_effects":
                parameterType = getParameterType("potion_effects", Map.class);
                break;
            case "type":
                parameterType = getParameterType(EntityType.class);
                break;
            case "weather":
                parameterType = getParameterType("weather", String.class);
                break;
            case "color2":
            case "color":
                parameterType = getParameterType("color", String.class);
                break;
            case "damage_type":
                parameterType = getParameterType("damage_type", String.class);
                break;
            case "material":
            case "brush":
                parameterType = getParameterType(Material.class);
                break;
            case "biome":
                parameterType = getParameterType(Biome.class);
                break;
            case "particle":
                parameterType = getParameterType(ParticleEffect.class);
                break;
            case "sound":
                parameterType = getParameterType(Sound.class);
                break;
            case "firework":
                parameterType = getParameterType(FireworkEffect.Type.class);
                break;
            case "effect":
                parameterType = getParameterType(Effect.Type.class);
                break;
            case "source_location":
            case "target_location":
                parameterType = getParameterType(SourceLocation.LocationType.class);
                break;
            case "location_offset":
            case "offset":
            case "random_source_offset":
            case "random_target_offset":
            case "relative_offset":
            case "relative_source_offset":
            case "relative_target_offset":
            case "return_offset":
            case "return_relative_offset":
            case "source_direction_offset":
            case "source_offset":
            case "origin_offset":
            case "target_direction_offset":
            case "target_offset":
            case "velocity_offset":
                parameterType = getParameterType(Vector.class);
                break;
            default:
                parameterType = getParameterType(defaultClass);
        }
        return new Parameter(key, parameterType);
    }
}
