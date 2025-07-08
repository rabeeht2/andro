# How to Build Your Android APK with Capacitor

This guide will walk you through the steps to take your web app and build an Android APK file that can be installed on a device.

**Prerequisites:**
1.  **Node.js & npm:** You should already have this.
2.  **Android Studio:** You must install Android Studio, which is the official IDE for Android development. You can download it from the [Android Developer website](https://developer.android.com/studio). Follow the installation instructions for your operating system.

---

### Step 1: Install Dependencies

I have already added the necessary Capacitor packages to your `package.json` file. These will be installed automatically.

### Step 2: Add the Android Platform

Capacitor needs to create a native Android project. Open your terminal in the root of this project and run the following command:

```bash
npx cap add android
```

This will create a new `android` directory in your project. This directory contains a full native Android project.

### Step 3: Build and Sync Your Web App

Next, you need to build your Next.js web app and copy the files into the native Android project. I've created a script to make this easy. Run:

```bash
npm run android:sync
```

This command first runs `next build` to create a production-ready version of your web app in the `out` directory, and then it runs `npx cap sync android` to copy those web files into the `android` project.

### Step 4: Open the Project in Android Studio

Now it's time to open the native project. Run this command in your terminal:

```bash
npm run android:open
```

This will automatically launch Android Studio and open your new Android project.

### Step 5: Build the APK in Android Studio

Once the project is open and has finished syncing in Android Studio, you can build the APK.

1.  In the top menu bar, go to **Build**.
2.  Select **Build Bundle(s) / APK(s)**.
3.  Click on **Build APK(s)**.

Android Studio will now compile and build your application. When it's finished, a notification will appear in the bottom-right corner of the window with a link to **"locate"** the APK file on your computer.

You can now take that `.apk` file, transfer it to your Android device, and install it!
