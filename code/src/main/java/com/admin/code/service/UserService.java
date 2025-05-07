package com.admin.code.service;

import com.admin.code.dto.AuthResponse;
import com.admin.code.dto.LoginRequest;
import com.admin.code.model.User;
import com.admin.code.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse registerUser(String username, String password) {
        // Check if username already exists
        if (userRepository.findByUsername(username).isPresent()) {
            return new AuthResponse(false, "Username already exists");
        }

        // Create and save new user
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setLocked(false);
        userRepository.save(user);

        return new AuthResponse(true, "Registration successful");
    }

    public AuthResponse loginUser(LoginRequest loginRequest) {
        Optional<User> userOpt = userRepository.findByUsername(loginRequest.getUsername());

        if (userOpt.isEmpty()) {
            return new AuthResponse(false, "User not found");
        }

        User user = userOpt.get();

        if (user.isLocked()) {
            return new AuthResponse(false, "Account is locked");
        }

        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return new AuthResponse(true, "Login successful");
        } else {
            return new AuthResponse(false, "Invalid password");
        }
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public int countLockedUsers() {
        return userRepository.countByLockedTrue();
    }
}