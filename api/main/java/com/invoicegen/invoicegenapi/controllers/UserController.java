package com.invoicegen.invoicegenapi.controllers;

import com.invoicegen.invoicegenapi.dto.*;
import com.invoicegen.invoicegenapi.services.UserService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;

import static org.springframework.http.MediaType.IMAGE_PNG_VALUE;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PutMapping("/logo")
    public ResponseEntity<?> uploadLogo(@RequestParam("logo") MultipartFile file) throws IOException {
        return ResponseEntity.status(HttpStatus.OK).body(userService.uploadLogo(file));
    }

    @GetMapping("/logo")
    public ResponseEntity<?> downloadLogo() {
        return ResponseEntity.status(HttpStatus.OK)
                .contentType(MediaType.valueOf(IMAGE_PNG_VALUE))
                .body(userService.getLogo());
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(@RequestParam(required = false) LocalDate startDate,
                                                  @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getStats(startDate, endDate));
    }

    @GetMapping("/stats/last")
    public ResponseEntity<LastThreeMonthsResponse> getLastThreeMonthsTotals() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getLastThreeMonthsTotals());
    }

    @GetMapping("/info")
    public ResponseEntity<InfoResponse> getInfo() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserInfo());
    }

    @GetMapping("/company")
    public ResponseEntity<CompanyResponse> getUserCompany() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.getUserCompany());
    }

    @PutMapping("/info")
    public ResponseEntity<String> changeUserInfo(@RequestBody UserInfoRequest userInfo) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.changeUserInfo(userInfo));
    }

    @DeleteMapping()
    public ResponseEntity<String> deleteUser() {
        return ResponseEntity.status(HttpStatus.OK).body(userService.deleteUser());
    }

    @PutMapping("/company")
    public ResponseEntity<String> changeUserCompany(@RequestBody CompanyRequest companyRequest) {
        return ResponseEntity.status(HttpStatus.OK).body(userService.changeUserCompany(companyRequest));
    }
}
