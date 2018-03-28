package com.elmakers.mine.bukkit.meta;

import java.util.HashSet;
import java.util.Map;
import java.util.Set;

import javax.annotation.Nonnull;

import org.bukkit.FireworkEffect;
import org.bukkit.Material;
import org.bukkit.Sound;
import org.bukkit.block.Biome;
import org.bukkit.configuration.ConfigurationSection;
import org.bukkit.configuration.MemorySection;
import org.bukkit.entity.EntityType;
import org.bukkit.util.Vector;
import com.elmakers.mine.bukkit.magic.SourceLocation;
import com.elmakers.mine.bukkit.slikey.effectlib.util.ParticleEffect;

public class InterrogatingConfigurationSection extends MemorySection {
    private Set<Parameter> parameters = new HashSet<>();
    private final ParameterTypeStore parameterStore;

    public InterrogatingConfigurationSection(@Nonnull ParameterTypeStore parameterStore) {
        super();
        this.parameterStore = parameterStore;
    }

    @Override
    public int getInt(String path, int def) {
        parameters.add(new Parameter(path, parameterStore.getParameterType(Integer.class)));
        return super.getInt(path, def);
    }

    @Override
    public double getDouble(String path, double def) {
        parameters.add(new Parameter(path, parameterStore.getParameterType(Double.class)));
        return super.getDouble(path, def);
    }

    @Override
    public long getLong(String path, long def) {
        parameters.add(new Parameter(path, parameterStore.getParameterType(Long.class)));
        return super.getLong(path, def);
    }

    @Override
    public ConfigurationSection getConfigurationSection(String path) {
        // Easier to do this here then fill it in by hand
        ParameterType parameterType;
        switch (path) {
            case "add_effects":
            case "remove_effects":
                parameterType = parameterStore.getParameterType("potion_effects", Map.class);
                break;
            default:
                parameterType = parameterStore.getParameterType(Map.class);
        }

        parameters.add(new Parameter(path, parameterType));
        return super.getConfigurationSection(path);
    }

    @Override
    public String getString(String path, String def) {
        // Easier to do this here then fill it in by hand
        ParameterType parameterType;
        switch (path) {
            case "type":
                parameterType = parameterStore.getParameterType(EntityType.class);
                break;
            case "weather":
                parameterType = parameterStore.getParameterType("weather", String.class);
                break;
            case "color2":
            case "color":
                parameterType = parameterStore.getParameterType("color", String.class);
                break;
            case "damage_type":
                parameterType = parameterStore.getParameterType("damage_type", String.class);
                break;
            case "material":
            case "brush":
                parameterType = parameterStore.getParameterType(Material.class);
                break;
            case "biome":
                parameterType = parameterStore.getParameterType(Biome.class);
                break;
            case "particle":
                parameterType = parameterStore.getParameterType(ParticleEffect.class);
                break;
            case "sound":
                parameterType = parameterStore.getParameterType(Sound.class);
                break;
            case "firework":
                parameterType = parameterStore.getParameterType(FireworkEffect.Type.class);
                break;
            case "source_location":
            case "target_location":
                parameterType = parameterStore.getParameterType(SourceLocation.LocationType.class);
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
                parameterType = parameterStore.getParameterType(Vector.class);
                break;
            default:
                parameterType = parameterStore.getParameterType(String.class);
        }

        parameters.add(new Parameter(path, parameterType));
        return super.getString(path, def);
    }

    @Override
    public boolean getBoolean(String path, boolean def) {
        parameters.add(new Parameter(path, parameterStore.getParameterType(Boolean.class)));
        return super.getBoolean(path, def);
    }

    /*

    I was hoping this would catch cases like PotionEffectAction's list of effect_ parameters,
    but for some reason it does not.

    I was then worried it would cause parameters to show up incorrectly as Strings, so basically
    just avoiding this for now.

    @Override
    public boolean contains(String path) {
        parameters.add(new Parameter(path, parameterStore.getParameterType(String.class)));
        return super.contains(path);
    }
    */

    @Nonnull
    public Set<Parameter> getParameters() {
        return parameters;
    }
}
