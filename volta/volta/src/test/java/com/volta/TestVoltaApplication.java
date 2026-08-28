package com.volta;

import org.springframework.boot.SpringApplication;

public class TestVoltaApplication {

	public static void main(String[] args) {
		SpringApplication.from(VoltaApplication::main).with(TestcontainersConfiguration.class).run(args);
	}

}
