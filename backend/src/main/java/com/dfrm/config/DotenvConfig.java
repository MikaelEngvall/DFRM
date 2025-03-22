package com.dfrm.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

/**
 * Denna klass finns endast kvar för bakåtkompatibilitet.
 * All funktionalitet har flyttats till EnvConfigUnified.
 *
 * @deprecated Ersatt av {@link EnvConfigUnified}
 */
@Configuration
@Import(EnvConfigUnified.class)
@Deprecated
public class DotenvConfig {
    // Tomt skal - all funktionalitet finns nu i EnvConfigUnified
} 