package com.elmakers.mine.bukkit.meta;

import javax.annotation.Nonnull;

import de.slikey.effectlib.Effect;

public class EffectDescription extends Configurable {

    public EffectDescription() {}

    public EffectDescription(@Nonnull Class<? extends Effect> actionClass, @Nonnull ParameterList parameters) {
        super(actionClass, parameters, "Effect");
    }
}
