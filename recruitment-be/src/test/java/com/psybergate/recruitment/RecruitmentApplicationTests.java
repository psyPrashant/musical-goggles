package com.psybergate.recruitment;

import org.junit.jupiter.api.Test;
import org.springframework.test.context.ContextConfiguration;

@ContextConfiguration(initializers = TestDatasourceInitializer.class)
class RecruitmentApplicationTests extends AbstractIntegrationTest {

	@Test
	void contextLoads() {
	}

}
