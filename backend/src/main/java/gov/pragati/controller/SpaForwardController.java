package gov.pragati.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Controller to forward SPA client-side routes to index.html
 * Enables single-server hosting of Spring Boot Backend + React Frontend.
 */
@Controller
public class SpaForwardController {

    @GetMapping(value = {
        "/",
        "/login",
        "/dashboard",
        "/projects",
        "/projects/**",
        "/map",
        "/risk",
        "/alerts",
        "/issues",
        "/reports",
        "/audit",
        "/settings"
    })
    public String forwardSpaRoutes() {
        return "forward:/index.html";
    }
}
