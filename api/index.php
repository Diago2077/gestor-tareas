<?php

// Vercel uses a read-only filesystem, so we MUST redirect Laravel storage/cache to /tmp.
$_ENV['VIEW_COMPILED_PATH'] = '/tmp/views';
$_ENV['SESSION_DRIVER'] = 'database';
$_ENV['LOG_CHANNEL'] = 'stderr';

if (!is_dir('/tmp/views')) {
    mkdir('/tmp/views', 0777, true);
}

require __DIR__ . '/../public/index.php';
