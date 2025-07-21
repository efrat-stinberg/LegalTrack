import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthResponse, AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCheckboxModule,
    MatDividerModule
  ],
  template: `
    <div class="login-container">
      
      <!-- Enhanced Background with Particles -->
      <div class="background-wrapper">
        <div class="particle-field">
          @for (i of particleArray; track i) {
            <div class="particle" [style.animation-delay.s]="getRandomDelay()"></div>
          }
        </div>
        <div class="gradient-orbs">
          <div class="orb orb-1"></div>
          <div class="orb orb-2"></div>
          <div class="orb orb-3"></div>
          <div class="orb orb-4"></div>
        </div>
        <div class="geometric-shapes">
          <div class="shape shape-triangle"></div>
          <div class="shape shape-circle"></div>
          <div class="shape shape-square"></div>
        </div>
      </div>
      
      <!-- Main Content -->
      <div class="content-wrapper">
        
        <!-- Floating Login Card -->
        <div class="login-card-container">
          <div class="card-glow"></div>
          <mat-card class="login-card">
            
            <!-- Premium Header with Glass Effect -->
            <div class="card-header">
              <div class="logo-section">
                <div class="logo-container">
                  <div class="logo-background"></div>
                  <div class="logo-icon">
                    <mat-icon>gavel</mat-icon>
                    <div class="icon-glow"></div>
                  </div>
                </div>
                
                <div class="brand-info">
                  <h1 class="brand-title">
                    <span class="title-part">Legal</span>
                    <span class="title-part accent">Flow</span>
                  </h1>
                  <p class="brand-subtitle">
                    <span class="subtitle-icon">✨</span>
                    Admin Panel Premium
                    <span class="subtitle-badge">Pro</span>
                  </p>
                </div>
              </div>
              
              <div class="welcome-section">
                <h2 class="welcome-title">ברוכים הבאים!</h2>
                <p class="welcome-text">
                  התחברו לחוויה מתקדמת של ניהול משרד עורכי דין
                </p>
                <div class="header-decoration">
                  <div class="decoration-line"></div>
                  <div class="decoration-diamond"></div>
                  <div class="decoration-line"></div>
                </div>
              </div>
            </div>

            <!-- Enhanced Form Section -->
            <mat-card-content class="card-content">
              <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="premium-form">
                
                <!-- Email Field with Enhanced Design -->
                <div class="form-group">
                  <mat-form-field appearance="outline" class="premium-field">
                    <mat-label>כתובת אימייל</mat-label>
                    <input matInput 
                           type="email" 
                           formControlName="email" 
                           placeholder="admin@legalflow.co.il"
                           autocomplete="email">
                    <mat-icon matPrefix class="field-icon">alternate_email</mat-icon>
                    <div class="field-decoration"></div>
                    @if (loginForm.get('email')?.hasError('required')) {
                      <mat-error>
                        <mat-icon>error_outline</mat-icon>
                        אימייל הוא שדה חובה
                      </mat-error>
                    }
                    @if (loginForm.get('email')?.hasError('email')) {
                      <mat-error>
                        <mat-icon>error_outline</mat-icon>
                        כתובת אימייל לא תקינה
                      </mat-error>
                    }
                  </mat-form-field>
                </div>

                <!-- Password Field with Enhanced Design -->
                <div class="form-group">
                  <mat-form-field appearance="outline" class="premium-field">
                    <mat-label>סיסמה</mat-label>
                    <input matInput 
                           [type]="hidePassword ? 'password' : 'text'" 
                           formControlName="password" 
                           placeholder="הכניסו סיסמה מאובטחת"
                           autocomplete="current-password">
                    <mat-icon matPrefix class="field-icon">lock</mat-icon>
                    <button mat-icon-button 
                            matSuffix 
                            (click)="hidePassword = !hidePassword"
                            type="button"
                            class="password-toggle"
                            [attr.aria-label]="'הצג סיסמה'"
                            [attr.aria-pressed]="!hidePassword">
                      <mat-icon class="toggle-icon">
                        {{ hidePassword ? 'visibility_off' : 'visibility' }}
                      </mat-icon>
                    </button>
                    <div class="field-decoration"></div>
                    @if (loginForm.get('password')?.hasError('required')) {
                      <mat-error>
                        <mat-icon>error_outline</mat-icon>
                        סיסמה היא שדה חובה
                      </mat-error>
                    }
                    @if (loginForm.get('password')?.hasError('minlength')) {
                      <mat-error>
                        <mat-icon>error_outline</mat-icon>
                        סיסמה חייבת להכיל לפחות 5 תווים
                      </mat-error>
                    }
                  </mat-form-field>
                </div>

                <!-- Enhanced Options Section -->
                <div class="form-options">
                  <mat-checkbox formControlName="rememberMe" class="premium-checkbox">
                    <span class="checkbox-text">
                      <mat-icon class="checkbox-icon">memory</mat-icon>
                      זכור אותי למשך 30 יום
                    </span>
                  </mat-checkbox>
                  <button type="button" mat-button class="forgot-password" disabled>
                    <mat-icon>help_outline</mat-icon>
                    שכחתם סיסמה?
                  </button>
                </div>

                <!-- Premium Submit Button -->
                <button mat-raised-button 
                        color="primary" 
                        type="submit" 
                        class="premium-submit-button"
                        [disabled]="loginForm.invalid || loading">
                  <div class="button-content">
                    @if (loading) {
                      <mat-spinner diameter="20" class="button-spinner"></mat-spinner>
                      <span class="button-text">מתחבר...</span>
                      <div class="loading-dots">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                      </div>
                    } @else {
                      <mat-icon class="button-icon">login</mat-icon>
                      <span class="button-text">התחבר למערכת</span>
                      <mat-icon class="button-arrow">arrow_back</mat-icon>
                    }
                    <div class="button-glow"></div>
                  </div>
                </button>

              </form>
            </mat-card-content>

            <!-- Enhanced Footer -->
            <mat-divider class="premium-divider"></mat-divider>
            
            <mat-card-actions class="card-footer">
              <div class="footer-content">
                <div class="footer-text">
                  <mat-icon class="footer-icon">admin_panel_settings</mat-icon>
                  <span>אין לכם חשבון מנהל עדיין?</span>
                </div>
                <button mat-raised-button 
                        color="accent" 
                        (click)="goToRegister()"
                        class="premium-register-button">
                  <div class="button-shine"></div>
                  <mat-icon>person_add</mat-icon>
                  <span>צרו חשבון מנהל</span>
                  <mat-icon class="button-arrow">arrow_back</mat-icon>
                </button>
              </div>
            </mat-card-actions>

          </mat-card>
        </div>
        
        <!-- Premium Feature Cards -->
        <div class="features-section">
          <div class="features-grid">
            <div class="feature-card">
              <div class="feature-icon security">
                <mat-icon>security</mat-icon>
              </div>
              <div class="feature-content">
                <h4>אבטחה מתקדמת</h4>
                <p>הצפנה ברמה בנקאית</p>
              </div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon cloud">
                <mat-icon>cloud_done</mat-icon>
              </div>
              <div class="feature-content">
                <h4>גיבוי אוטומטי</h4>
                <p>נתונים מאובטחים בענן</p>
              </div>
            </div>
            
            <div class="feature-card">
              <div class="feature-icon support">
                <mat-icon>support_agent</mat-icon>
              </div>
              <div class="feature-content">
                <h4>תמיכה 24/7</h4>
                <p>צוות מומחים זמין תמיד</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    /* Enhanced Background */
    .background-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle at 20% 50%, #667eea 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, #764ba2 0%, transparent 50%),
                  radial-gradient(circle at 40% 80%, #f093fb 0%, transparent 50%),
                  linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
      z-index: 1;
    }

    .particle-field {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .particle {
      position: absolute;
      width: 3px;
      height: 3px;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      animation: float 15s infinite linear;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
    }

    @keyframes float {
      0% {
        transform: translateY(100vh) rotate(0deg);
        opacity: 0;
      }
      10% {
        opacity: 1;
      }
      90% {
        opacity: 1;
      }
      100% {
        transform: translateY(-100px) rotate(360deg);
        opacity: 0;
      }
    }

    .gradient-orbs {
      position: absolute;
      width: 100%;
      height: 100%;
    }

    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(40px);
      animation: orbFloat 20s infinite ease-in-out;
    }

    .orb-1 {
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.4) 0%, transparent 70%);
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }

    .orb-2 {
      width: 200px;
      height: 200px;
      background: radial-gradient(circle, rgba(240, 147, 251, 0.4) 0%, transparent 70%);
      top: 60%;
      right: 15%;
      animation-delay: 7s;
    }

    .orb-3 {
      width: 250px;
      height: 250px;
      background: radial-gradient(circle, rgba(118, 75, 162, 0.3) 0%, transparent 70%);
      bottom: 20%;
      left: 20%;
      animation-delay: 14s;
    }

    .orb-4 {
      width: 180px;
      height: 180px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
      top: 30%;
      right: 30%;
      animation-delay: 10s;
    }

    @keyframes orbFloat {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -30px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
    }

    .geometric-shapes {
      position: absolute;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .shape {
      position: absolute;
      opacity: 0.1;
      animation: shapeRotate 25s infinite linear;
    }

    .shape-triangle {
      width: 0;
      height: 0;
      border-left: 25px solid transparent;
      border-right: 25px solid transparent;
      border-bottom: 43px solid #fff;
      top: 20%;
      left: 15%;
      animation-delay: 0s;
    }

    .shape-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: #fff;
      top: 70%;
      right: 25%;
      animation-delay: 8s;
    }

    .shape-square {
      width: 40px;
      height: 40px;
      background: #fff;
      top: 40%;
      left: 70%;
      animation-delay: 15s;
      transform-origin: center;
    }

    @keyframes shapeRotate {
      0% { transform: rotate(0deg) translateX(50px) rotate(0deg); }
      100% { transform: rotate(360deg) translateX(50px) rotate(-360deg); }
    }

    /* Content Wrapper */
    .content-wrapper {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 40px;
    }

    /* Enhanced Login Card */
    .login-card-container {
      position: relative;
      width: 100%;
      max-width: 480px;
      animation: cardEntrance 1s ease-out;
    }

    @keyframes cardEntrance {
      0% {
        opacity: 0;
        transform: translateY(30px) scale(0.95);
      }
      100% {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .card-glow {
      position: absolute;
      top: -20px;
      left: -20px;
      right: -20px;
      bottom: -20px;
      background: linear-gradient(45deg, 
        rgba(102, 126, 234, 0.3) 0%, 
        rgba(240, 147, 251, 0.3) 50%, 
        rgba(118, 75, 162, 0.3) 100%);
      border-radius: 32px;
      filter: blur(20px);
      animation: glowPulse 4s infinite ease-in-out;
    }

    @keyframes glowPulse {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.05); }
    }

    .login-card {
      position: relative;
      border-radius: 28px !important;
      background: rgba(255, 255, 255, 0.95) !important;
      backdrop-filter: blur(30px) !important;
      border: 1px solid rgba(255, 255, 255, 0.3) !important;
      box-shadow: 
        0 25px 80px rgba(0, 0, 0, 0.15),
        0 12px 32px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
      overflow: hidden;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .login-card:hover {
      transform: translateY(-8px);
      box-shadow: 
        0 35px 100px rgba(0, 0, 0, 0.2),
        0 20px 40px rgba(0, 0, 0, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    /* Premium Header */
    .card-header {
      padding: 48px 40px 32px 40px;
      background: linear-gradient(135deg, 
        rgba(255, 255, 255, 0.9) 0%, 
        rgba(248, 250, 255, 0.8) 100%);
      position: relative;
      overflow: hidden;
    }

    .card-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(102, 126, 234, 0.5) 50%, 
        transparent 100%);
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 20px;
      margin-bottom: 32px;
      direction: ltr;
    }

    .logo-container {
      position: relative;
      width: 72px;
      height: 72px;
    }

    .logo-background {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      animation: logoFloat 6s infinite ease-in-out;
    }

    .logo-icon {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2;
    }

    .logo-icon mat-icon {
      font-size: 36px;
      width: 36px;
      height: 36px;
      color: white;
      text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .icon-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 80px;
      height: 80px;
      transform: translate(-50%, -50%);
      background: radial-gradient(circle, rgba(255, 215, 0, 0.3) 0%, transparent 70%);
      border-radius: 50%;
      animation: iconGlow 3s infinite ease-in-out;
    }

    @keyframes logoFloat {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-3px) rotate(2deg); }
    }

    @keyframes iconGlow {
      0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
      50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
    }

    .brand-info {
      flex: 1;
      text-align: right;
    }

    .brand-title {
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      letter-spacing: -1px;
      background: linear-gradient(45deg, #1a237e, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
    }

    .title-part {
      display: inline-block;
      animation: titleSlide 1s ease-out forwards;
    }

    .title-part.accent {
      animation-delay: 0.3s;
    }

    @keyframes titleSlide {
      0% {
        opacity: 0;
        transform: translateX(20px);
      }
      100% {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .brand-subtitle {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      color: #666;
      font-size: 14px;
      font-weight: 500;
    }

    .subtitle-icon {
      animation: sparkle 2s infinite ease-in-out;
    }

    @keyframes sparkle {
      0%, 100% { opacity: 0.6; transform: scale(1); }
      50% { opacity: 1; transform: scale(1.2); }
    }

    .subtitle-badge {
      background: linear-gradient(45deg, #ffd700, #ffed4e);
      color: #1a237e;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(255, 215, 0, 0.3);
    }

    .welcome-section {
      text-align: center;
    }

    .welcome-title {
      font-size: 28px;
      font-weight: 600;
      margin: 0 0 12px 0;
      color: #1a237e;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .welcome-text {
      font-size: 16px;
      color: #666;
      margin: 0 0 24px 0;
      line-height: 1.5;
    }

    .header-decoration {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
    }

    .decoration-line {
      height: 1px;
      width: 60px;
      background: linear-gradient(90deg, transparent, #667eea, transparent);
    }

    .decoration-diamond {
      width: 8px;
      height: 8px;
      background: #667eea;
      transform: rotate(45deg);
      animation: diamondRotate 4s infinite ease-in-out;
    }

    @keyframes diamondRotate {
      0%, 100% { transform: rotate(45deg) scale(1); }
      50% { transform: rotate(225deg) scale(1.2); }
    }

    /* Enhanced Form */
    .card-content {
      padding: 40px !important;
    }

    .premium-form {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .form-group {
      position: relative;
    }

    .premium-field {
      width: 100%;
      position: relative;
    }

    .premium-field .mat-mdc-text-field-wrapper {
      border-radius: 16px !important;
      background: rgba(255, 255, 255, 0.8);
      backdrop-filter: blur(10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .premium-field:hover .mat-mdc-text-field-wrapper {
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .premium-field.mat-focused .mat-mdc-text-field-wrapper {
      background: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
      box-shadow: 0 12px 40px rgba(102, 126, 234, 0.15);
    }

    .field-icon {
      color: #667eea !important;
      margin-right: 12px;
    }

    .field-decoration {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #667eea, #764ba2);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .premium-field.mat-focused .field-decoration {
      transform: scaleX(1);
    }

    .password-toggle {
      color: #667eea !important;
      transition: all 0.3s ease;
    }

    .password-toggle:hover {
      background: rgba(102, 126, 234, 0.1) !important;
      transform: scale(1.1);
    }

    .toggle-icon {
      transition: transform 0.3s ease;
    }

    .password-toggle:hover .toggle-icon {
      transform: rotate(10deg);
    }

    /* Enhanced Options */
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -8px 0 8px 0;
    }

    .premium-checkbox {
      font-size: 14px;
      color: #666;
    }

    .premium-checkbox .mat-mdc-checkbox-frame {
      border-radius: 6px;
      border-color: #667eea;
    }

    .checkbox-text {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .checkbox-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
      color: #667eea;
    }

    .forgot-password {
      font-size: 14px;
      color: #667eea;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .forgot-password:hover:not(:disabled) {
      background: rgba(102, 126, 234, 0.1);
      transform: translateY(-1px);
    }

    .forgot-password:disabled {
      color: #ccc;
    }

    /* Premium Submit Button */
    .premium-submit-button {
      height: 64px !important;
      border-radius: 16px !important;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
      position: relative;
      overflow: hidden;
      font-size: 16px !important;
      font-weight: 600 !important;
      letter-spacing: 0.5px;
      box-shadow: 
        0 8px 32px rgba(102, 126, 234, 0.4),
        0 4px 16px rgba(0, 0, 0, 0.1) !important;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .premium-submit-button:hover:not(:disabled) {
      transform: translateY(-4px);
      box-shadow: 
        0 16px 48px rgba(102, 126, 234, 0.5),
        0 8px 24px rgba(0, 0, 0, 0.15);
    }

    .premium-submit-button:active:not(:disabled) {
      transform: translateY(-2px);
    }

    .button-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      position: relative;
      z-index: 2;
    }

    .button-icon,
    .button-arrow {
      transition: all 0.3s ease;
    }

    .premium-submit-button:hover .button-icon {
      transform: scale(1.1);
    }

    .premium-submit-button:hover .button-arrow {
      transform: translateX(-4px);
    }

    .button-glow {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.3), 
        transparent);
      transition: left 0.6s ease;
    }

    .premium-submit-button:hover .button-glow {
      left: 100%;
    }

    .button-spinner {
      margin-left: 8px;
    }

    .loading-dots {
      display: flex;
      gap: 4px;
      margin-right: 8px;
    }

    .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.8);
      animation: dotBounce 1.4s infinite ease-in-out both;
    }

    .dot:nth-child(1) { animation-delay: -0.32s; }
    .dot:nth-child(2) { animation-delay: -0.16s; }

    @keyframes dotBounce {
      0%, 80%, 100% { transform: scale(0); }
      40% { transform: scale(1); }
    }

    .premium-submit-button:disabled {
      background: linear-gradient(135deg, #e0e0e0 0%, #bdbdbd 100%) !important;
      color: #999 !important;
      transform: none !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    }

    /* Premium Divider */
    .premium-divider {
      margin: 0 !important;
      background: linear-gradient(90deg, 
        transparent 0%, 
        rgba(102, 126, 234, 0.2) 50%, 
        transparent 100%) !important;
      height: 1px !important;
    }

    /* Enhanced Footer */
    .card-footer {
      padding: 32px 40px !important;
      background: linear-gradient(135deg, 
        rgba(248, 250, 255, 0.8) 0%, 
        rgba(255, 255, 255, 0.9) 100%);
    }

    .footer-content {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      text-align: center;
    }

    .footer-text {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    .footer-icon {
      color: #667eea;
      font-size: 18px;
      width: 18px;
      height: 18px;
    }

    .premium-register-button {
      position: relative;
      overflow: hidden;
      border-radius: 12px !important;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%) !important;
      padding: 16px 32px !important;
      font-weight: 600 !important;
      box-shadow: 0 6px 24px rgba(240, 147, 251, 0.3) !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }

    .premium-register-button:hover {
      transform: translateY(-3px);
      box-shadow: 0 12px 36px rgba(240, 147, 251, 0.4);
    }

    .button-shine {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, 
        transparent, 
        rgba(255, 255, 255, 0.4), 
        transparent);
      transition: left 0.8s ease;
    }

    .premium-register-button:hover .button-shine {
      left: 100%;
    }

    /* Features Section */
    .features-section {
      width: 100%;
      max-width: 600px;
      animation: featuresSlideUp 1s ease-out 0.5s both;
    }

    @keyframes featuresSlideUp {
      0% {
        opacity: 0;
        transform: translateY(40px);
      }
      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 20px;
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border-radius: 20px;
      padding: 24px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.3);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(90deg, #667eea, #764ba2, #f093fb);
      transform: scaleX(0);
      transition: transform 0.4s ease;
    }

    .feature-card:hover {
      transform: translateY(-8px);
      box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
    }

    .feature-card:hover::before {
      transform: scaleX(1);
    }

    .feature-icon {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px auto;
      position: relative;
      overflow: hidden;
    }

    .feature-icon::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: inherit;
      filter: blur(10px);
      opacity: 0.3;
    }

    .feature-icon mat-icon {
      color: white;
      font-size: 28px;
      width: 28px;
      height: 28px;
      position: relative;
      z-index: 2;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .feature-icon.security {
      background: linear-gradient(135deg, #4caf50, #81c784);
    }

    .feature-icon.cloud {
      background: linear-gradient(135deg, #2196f3, #64b5f6);
    }

    .feature-icon.support {
      background: linear-gradient(135deg, #ff9800, #ffb74d);
    }

    .feature-content h4 {
      font-size: 16px;
      font-weight: 600;
      margin: 0 0 8px 0;
      color: #333;
    }

    .feature-content p {
      font-size: 14px;
      color: #666;
      margin: 0;
      line-height: 1.4;
    }

    /* Error Messages Enhancement */
    .mat-mdc-form-field-error {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      margin-top: 4px;
    }

    .mat-mdc-form-field-error mat-icon {
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #f44336;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .login-container {
        padding: 16px;
      }

      .content-wrapper {
        gap: 24px;
      }

      .login-card-container {
        max-width: 100%;
      }

      .card-glow {
        top: -10px;
        left: -10px;
        right: -10px;
        bottom: -10px;
      }

      .login-card {
        border-radius: 20px !important;
      }

      .card-header {
        padding: 32px 24px 24px 24px;
      }

      .logo-section {
        flex-direction: column;
        text-align: center;
        gap: 16px;
      }

      .brand-info {
        text-align: center;
      }

      .brand-title {
        font-size: 28px;
        justify-content: center;
      }

      .welcome-title {
        font-size: 24px;
      }

      .welcome-text {
        font-size: 14px;
      }

      .card-content {
        padding: 24px !important;
      }

      .premium-form {
        gap: 24px;
      }

      .form-options {
        flex-direction: column;
        align-items: flex-start;
        gap: 16px;
      }

      .premium-submit-button {
        height: 56px !important;
        font-size: 15px !important;
      }

      .card-footer {
        padding: 24px !important;
      }

      .footer-content {
        gap: 16px;
      }

      .features-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .feature-card {
        padding: 20px;
      }

      .feature-icon {
        width: 50px;
        height: 50px;
      }

      .feature-icon mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 12px;
      }

      .card-header {
        padding: 24px 20px 20px 20px;
      }

      .logo-container {
        width: 60px;
        height: 60px;
      }

      .logo-icon mat-icon {
        font-size: 30px;
        width: 30px;
        height: 30px;
      }

      .brand-title {
        font-size: 24px;
      }

      .welcome-title {
        font-size: 20px;
      }

      .card-content {
        padding: 20px !important;
      }

      .premium-submit-button {
        height: 52px !important;
        font-size: 14px !important;
      }

      .card-footer {
        padding: 20px !important;
      }

      .premium-register-button {
        padding: 14px 24px !important;
      }

      .features-section {
        display: none; /* Hide on very small screens */
      }
    }

    /* Accessibility Improvements */
    @media (prefers-reduced-motion: reduce) {
      * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    }

    @media (prefers-contrast: high) {
      .login-card {
        border: 2px solid #000 !important;
        background: #fff !important;
      }
      
      .premium-submit-button {
        border: 2px solid #000 !important;
      }
    }

    /* Focus Indicators */
    .premium-submit-button:focus-visible,
    .premium-register-button:focus-visible {
      outline: 3px solid rgba(102, 126, 234, 0.5);
      outline-offset: 2px;
    }

    /* Dark Mode Support */
    @media (prefers-color-scheme: dark) {
      .login-card {
        background: rgba(30, 30, 30, 0.95) !important;
        border: 1px solid rgba(255, 255, 255, 0.1) !important;
        color: #fff;
      }

      .card-header {
        background: linear-gradient(135deg, 
          rgba(40, 40, 40, 0.9) 0%, 
          rgba(30, 30, 30, 0.8) 100%);
      }

      .welcome-title {
        color: #fff;
      }

      .welcome-text,
      .footer-text {
        color: #ccc;
      }

      .feature-card {
        background: rgba(40, 40, 40, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #fff;
      }

      .feature-content h4 {
        color: #fff;
      }

      .feature-content p {
        color: #ccc;
      }
    }

    /* High Performance Optimizations */
    .login-card,
    .feature-card,
    .premium-submit-button {
      will-change: transform;
    }

    .particle {
      will-change: transform, opacity;
    }

    .orb {
      will-change: transform;
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  particleArray = Array(30).fill(0); // For particle effect

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(5)]],
      rememberMe: [false]
    });
  }

  ngOnInit(): void {
    // Check if already authenticated
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Add demo data for development
    this.loginForm.patchValue({
      email: 'admin@legal-flow.com',
      password: 'admin123'
    });

    // Randomly position particles
    this.initializeParticles();
  }

  private initializeParticles(): void {
    setTimeout(() => {
      const particles = document.querySelectorAll('.particle');
      particles.forEach((particle, index) => {
        const element = particle as HTMLElement;
        element.style.left = Math.random() * 100 + '%';
        element.style.animationDelay = Math.random() * 15 + 's';
        element.style.animationDuration = (15 + Math.random() * 10) + 's';
      });
    }, 100);
  }

  getRandomDelay(): number {
    return Math.random() * 15;
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.loading) {
      this.loading = true;
      
      const loginData = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };
      
      this.authService.login(loginData).subscribe({
        next: (response: AuthResponse) => {
          this.loading = false;
          this.showSuccess('התחברת בהצלחה! מעביר לדשבורד...');
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1000);
        },
        error: (error: any) => {
          this.loading = false;
          this.handleLoginError(error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register-admin']);
  }

  private handleLoginError(error: any): void {
    let errorMessage = 'שגיאה בהתחברות';
    
    if (error.status === 401) {
      errorMessage = 'אימייל או סיסמה שגויים';
    } else if (error.status === 403) {
      errorMessage = 'אין לך הרשאות מנהל';
    } else if (error.status === 429) {
      errorMessage = 'יותר מדי ניסיונות התחברות. נסה שוב מאוחר יותר';
    } else if (error.status === 0) {
      errorMessage = 'שגיאת רשת. בדוק את החיבור לאינטרנט';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    this.showError(errorMessage);
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'סגור', {
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'סגור', {
      duration: 6000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }
}