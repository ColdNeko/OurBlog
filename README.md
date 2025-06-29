# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started


 ## Wymagania wstępne  
 Zanim zaczniesz, upewnij się, że spełniasz poniższe wymagania:

- **Node.js**: Musisz mieć zainstalowany Node.js. Możesz go pobrać ze strony [nodejs.org](https://nodejs.org/).
 - **Expo CLI**: Zainstaluj Expo CLI globalnie, używając poniższego polecenia:  
   ```bash
   npm install -g expo-cli
   ```
- **Git**: (Opcjonalnie, ale zalecane) Powinieneś mieć zainstalowanego Gita, aby sklonować repozytorium. Możesz go pobrać ze strony [git-scm.com](https://git-scm.com/).

   
 - Zainstalowana aplikacja Expo Go na urządzeniu z iOS [App Store](https://apps.apple.com/app/apple-store/id982107779)).

  0.5. Po pobraniu archiwum należy je wypakować, i wejść do stworzonego folderu, tak aby zawartością były m.in. foldery app/ assets/ components/, w głównym folderze uruchomić terminal, z zainstalowanym Node.js

1. Zainstaluj zależności, **ze względu na wymóg aktualizacji SDK w trakcie pracy, pewne zależności mogły zostać uszkodzone i w przypadku niepowodzenia instalacji należy użyć polecenia z argumentem --legacy-peer-deps**

   ```bash
   npm install --legacy-peer-deps
   ```
1,5. Pobierz z moodle plik index.js i wstawić go do /constants/ ponieważ jest to plik zawierający klucze API do połączenia z bazą danych

2. Włącz aplikację

   ```bash
   npx expo start
   ```

3. Zostanie wygenerowany kod QR, który należy zeskanować na urządzeniu IOS z zainstalowanym Expo Go
