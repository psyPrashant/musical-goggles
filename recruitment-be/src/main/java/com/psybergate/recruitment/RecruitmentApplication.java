package com.psybergate.recruitment;

import com.psybergate.recruitment.judge0.Judge0Properties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(Judge0Properties.class)
public class RecruitmentApplication {

	public static void main(String[] args) {
		SpringApplication.run(RecruitmentApplication.class, args);
	}

}
