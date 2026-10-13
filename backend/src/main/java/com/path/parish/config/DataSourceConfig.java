package com.path.parish.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    @Value("${DATABASE_URL:#{null}}")
    private String databaseUrl;

    @Value("${spring.datasource.url:jdbc:h2:file:./data/path_parish_db;DB_CLOSE_ON_EXIT=FALSE;AUTO_RECONNECT=TRUE}")
    private String defaultJdbcUrl;

    @Value("${spring.datasource.username:sa}")
    private String defaultUsername;

    @Value("${spring.datasource.password:}")
    private String defaultPassword;

    @Value("${spring.datasource.driver-class-name:org.h2.Driver}")
    private String defaultDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();

        if (databaseUrl != null && !databaseUrl.isBlank() && !databaseUrl.startsWith("jdbc:h2:")) {
            try {
                if (databaseUrl.startsWith("postgres://") || databaseUrl.startsWith("postgresql://")) {
                    URI dbUri = new URI(databaseUrl.replace("postgres://", "postgresql://"));
                    String userInfo = dbUri.getUserInfo();
                    String username = userInfo != null && userInfo.contains(":") ? userInfo.split(":")[0] : userInfo;
                    String password = userInfo != null && userInfo.contains(":") ? userInfo.split(":")[1] : "";
                    int port = dbUri.getPort() != -1 ? dbUri.getPort() : 5432;
                    String jdbcUrl = "jdbc:postgresql://" + dbUri.getHost() + ":" + port + dbUri.getPath();

                    config.setJdbcUrl(jdbcUrl);
                    if (username != null) config.setUsername(username);
                    if (password != null) config.setPassword(password);
                    config.setDriverClassName("org.postgresql.Driver");
                    return new HikariDataSource(config);
                } else if (databaseUrl.startsWith("mysql://")) {
                    URI dbUri = new URI(databaseUrl);
                    String userInfo = dbUri.getUserInfo();
                    String username = userInfo != null && userInfo.contains(":") ? userInfo.split(":")[0] : userInfo;
                    String password = userInfo != null && userInfo.contains(":") ? userInfo.split(":")[1] : "";
                    int port = dbUri.getPort() != -1 ? dbUri.getPort() : 3306;
                    String jdbcUrl = "jdbc:mysql://" + dbUri.getHost() + ":" + port + dbUri.getPath();

                    config.setJdbcUrl(jdbcUrl);
                    if (username != null) config.setUsername(username);
                    if (password != null) config.setPassword(password);
                    config.setDriverClassName("com.mysql.cj.jdbc.Driver");
                    return new HikariDataSource(config);
                } else if (databaseUrl.startsWith("jdbc:")) {
                    config.setJdbcUrl(databaseUrl);
                    config.setUsername(defaultUsername);
                    config.setPassword(defaultPassword);
                    if (defaultDriver != null && !defaultDriver.isBlank()) {
                        config.setDriverClassName(defaultDriver);
                    }
                    return new HikariDataSource(config);
                }
            } catch (Exception e) {
                System.err.println("Failed to parse custom DATABASE_URL, falling back to default configuration: " + e.getMessage());
            }
        }

        // Default / H2 fallback
        config.setJdbcUrl(defaultJdbcUrl);
        config.setUsername(defaultUsername);
        config.setPassword(defaultPassword);
        config.setDriverClassName(defaultDriver);
        return new HikariDataSource(config);
    }
}
