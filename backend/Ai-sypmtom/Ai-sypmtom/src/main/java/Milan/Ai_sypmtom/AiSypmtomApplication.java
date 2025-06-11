package Milan.Ai_sypmtom;

import Milan.Ai_sypmtom.config.RsaKeyProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;

@SpringBootApplication
@EnableConfigurationProperties(RsaKeyProperties.class)
@EnableWebSocketMessageBroker
public class AiSypmtomApplication {

	public static void main(String[] args) {


		SpringApplication.run(AiSypmtomApplication.class, args);
	}

}
