package com.invoicegen.invoicegenapi.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.invoicegen.invoicegenapi.exceptions.responses.BaseErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.server.resource.InvalidBearerTokenException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final ObjectMapper objectMapper;

    public CustomAuthenticationEntryPoint() {
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule());
        this.objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        response.setContentType("application/json");

        String errorMessage = "Unauthorized access";
        int statusCode = HttpServletResponse.SC_UNAUTHORIZED;

        Throwable cause = authException.getCause();

        if (cause instanceof JwtException) {
            String message = cause.getMessage();
            if (message.contains("expiresAt")) {
                errorMessage = "Your token has expired. Please login again.";
            } else {
                errorMessage = "Invalid token. Please provide a valid token.";
            }
        }

        BaseErrorResponse errorResponse = BaseErrorResponse.builder()
                .statusCode(statusCode)
                .error("Unauthorized")
                .message(errorMessage)
                .path(request.getRequestURI())
                .build();

        response.setStatus(statusCode);
        objectMapper.writeValue(response.getOutputStream(), errorResponse);
    }
}