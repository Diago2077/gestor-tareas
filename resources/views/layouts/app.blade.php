<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Gestor de Tareas</title>
    <!-- Google Fonts: Roboto is the standard for Material/Appsheet -->
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
    <!-- Google Material Icons -->
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    <link href="/css/appsheet.css" rel="stylesheet">
</head>
<body>

    <!-- Header -->
    <header class="app-header">
        <button class="icon-button"><i class="material-icons">menu</i></button>
        <h1 class="app-title">@yield('title', 'Tasks')</h1>
        <button class="icon-button"><i class="material-icons">search</i></button>
    </header>

    <!-- Main Content -->
    <main class="app-content">
        @yield('content')
    </main>

    <!-- AppSheet Style Bottom Navigation (Optional but gives it the vibe) -->
    <nav class="bottom-nav">
        <a href="#" class="nav-item active">
            <i class="material-icons">list_alt</i>
            <span>Lista</span>
        </a>
        <a href="#" class="nav-item">
            <i class="material-icons">calendar_today</i>
            <span>Calendario</span>
        </a>
        <a href="#" class="nav-item">
            <i class="material-icons">settings</i>
            <span>Ajustes</span>
        </a>
    </nav>

    @stack('scripts')
</body>
</html>
