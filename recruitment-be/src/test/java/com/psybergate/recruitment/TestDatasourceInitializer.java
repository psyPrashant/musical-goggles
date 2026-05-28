package com.psybergate.recruitment;

import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.env.MapPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.Map;

public class TestDatasourceInitializer
        implements ApplicationContextInitializer<ConfigurableApplicationContext> {

    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        POSTGRES.start();
        // System properties are read live by Spring's SystemPropertiesPropertySource;
        // setting them here guarantees visibility before DataSourceAutoConfiguration runs.
        System.setProperty("spring.datasource.url", POSTGRES.getJdbcUrl());
        System.setProperty("spring.datasource.username", POSTGRES.getUsername());
        System.setProperty("spring.datasource.password", POSTGRES.getPassword());
        System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");
    }

    @Override
    public void initialize(ConfigurableApplicationContext context) {
        // Belt-and-suspenders: also inject via property source at highest priority.
        // Using a unique name to avoid collisions with TestcontainersPropertySourceAutoConfiguration.
        context.getEnvironment().getPropertySources().addFirst(
                new MapPropertySource("postgres-testcontainer", Map.of(
                        "spring.datasource.url", POSTGRES.getJdbcUrl(),
                        "spring.datasource.username", POSTGRES.getUsername(),
                        "spring.datasource.password", POSTGRES.getPassword(),
                        "spring.datasource.driver-class-name", "org.postgresql.Driver"
                ))
        );
    }
}
