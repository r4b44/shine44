<?php
// send-email.php - Obsługa formularza kontaktowego

// Ustawienia email
$to_email = "lukijanicki11@gmail.com"; // ZMIEŃ NA SWÓJ EMAIL!
$subject_prefix = "Nowe zapytanie - Shine Detailing";

// Sprawdź czy formularz został wysłany
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    // Zabezpieczenie przed spamem - sprawdź czy to nie bot
    if (!empty($_POST['honeypot'])) {
        die('Bot detected');
    }

    // Pobierz i oczyść dane z formularza
    $name = strip_tags(trim($_POST["name"]));
    $phone = strip_tags(trim($_POST["phone"]));
    $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
    $vehicle = strip_tags(trim($_POST["vehicle"]));
    $service = strip_tags(trim($_POST["service"]));
    $date = strip_tags(trim($_POST["date"]));
    $message = strip_tags(trim($_POST["message"]));

    // Walidacja danych
    $errors = [];

    if (empty($name)) {
        $errors[] = "Imię i nazwisko jest wymagane";
    }

    if (empty($phone)) {
        $errors[] = "Numer telefonu jest wymagany";
    }

    if (!empty($email) && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = "Nieprawidłowy adres email";
    }

    if (empty($service)) {
        $errors[] = "Wybór usługi jest wymagany";
    }

    // Jeśli są błędy, zwróć je
    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'errors' => $errors
        ]);
        exit;
    }

    // Przygotuj treść wiadomości
    $email_subject = $subject_prefix . " - " . $name;

    $email_body = "Nowe zapytanie z formularza na stronie Shine Detailing\n\n";
    $email_body .= "-----------------------------------\n\n";
    $email_body .= "Imię i nazwisko: $name\n";
    $email_body .= "Telefon: $phone\n";
    $email_body .= "Email: " . ($email ? $email : "Nie podano") . "\n";
    $email_body .= "Marka i model auta: " . ($vehicle ? $vehicle : "Nie podano") . "\n";
    $email_body .= "Wybrana usługa: $service\n";
    $email_body .= "Preferowany termin: " . ($date ? $date : "Nie podano") . "\n\n";
    $email_body .= "Dodatkowe informacje:\n";
    $email_body .= $message ? $message : "Brak dodatkowych informacji\n";
    $email_body .= "\n-----------------------------------\n";
    $email_body .= "Data wysłania: " . date('Y-m-d H:i:s') . "\n";

    // Nagłówki email
    $headers = "From: noreply@shinedetailing.pl\r\n";
    if (!empty($email)) {
        $headers .= "Reply-To: $email\r\n";
    }
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

    // Wyślij email
    if (mail($to_email, $email_subject, $email_body, $headers)) {
        // Sukces
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Dziękujemy! Twoje zapytanie zostało wysłane. Skontaktujemy się z Tobą w ciągu 24 godzin.'
        ]);
    } else {
        // Błąd wysyłania
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => 'Przepraszamy, wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie lub skontaktuj się telefonicznie.'
        ]);
    }

} else {
    // Nieprawidłowe żądanie
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Nieprawidłowe żądanie'
    ]);
}
?>
