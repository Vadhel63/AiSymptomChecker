package Milan.Ai_sypmtom.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class GlobalCorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 👈 allows all endpoints (even /chat/info)
                .allowedOrigins("*")  // 👈 or your frontend: "http://localhost:63342"
                .allowedMethods("*")
                .allowedHeaders("*");
    }
}
