package com.elmakers.mine.bukkit.meta;

import javax.annotation.Nonnull;

import com.elmakers.mine.bukkit.api.action.SpellAction;

public class SpellActionDescription extends Configurable {

    public SpellActionDescription() {

    }
    
    public SpellActionDescription(@Nonnull Class<? extends SpellAction> actionClass, @Nonnull ParameterList parameters) {
        super(actionClass, parameters, "Action");
    }
}
