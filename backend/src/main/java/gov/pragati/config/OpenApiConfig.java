package gov.pragati.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI pragatiOpenAPI() {
        final String securitySchemeName = "BearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("PRAGATI – AI-Powered Integrated Project Monitoring Platform API")
                        .description("REST API specifications for Government of India Problem Statement PRAGATI-2026. Supports EVM computation, AI Risk Prediction, SHAP Explainability, 2-Level Automated Escalations, and GIS spatial mapping.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("PRAGATI National Engineering Team")
                                .email("contact@pragati.gov.in"))
                        .license(new License().name("Government Open License - India").url("https://data.gov.in")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName,
                                new SecurityScheme()
                                        .name(securitySchemeName)
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
