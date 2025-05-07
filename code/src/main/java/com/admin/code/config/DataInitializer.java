package com.admin.code.config;

import com.admin.code.model.ReadingLog;
import com.admin.code.model.User;
import com.admin.code.repository.ReadingLogRepository;
import com.admin.code.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner init(UserRepository userRepository, ReadingLogRepository logRepository) {
        return args -> {
            // Add sample users
            if (userRepository.count() == 0) {
                User admin = new User();
                admin.setUsername("admin01");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setLocked(false);
                userRepository.save(admin);

                User john = new User();
                john.setUsername("john_doe");
                john.setPassword(passwordEncoder.encode("password123"));
                john.setLocked(true);
                userRepository.save(john);

                User alice = new User();
                alice.setUsername("alice_99");
                alice.setPassword(passwordEncoder.encode("alice_pass"));
                alice.setLocked(false);
                userRepository.save(alice);
            }

            // Add sample logs
            if (logRepository.count() == 0) {
                ReadingLog log1 = new ReadingLog();
                log1.setTitle("Learning JavaScript");
                log1.setAuthor("Jane Doe");
                log1.setFlagged(false);
                logRepository.save(log1);

                ReadingLog log2 = new ReadingLog();
                log2.setTitle("Advanced CSS");
                log2.setAuthor("John Smith");
                log2.setFlagged(true);
                logRepository.save(log2);

                ReadingLog log3 = new ReadingLog();
                log3.setTitle("HTML Basics");
                log3.setAuthor("Alice");
                log3.setFlagged(false);
                logRepository.save(log3);
            }
        };
    }
}
