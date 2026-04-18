<?php

// Vercel uses a read-only filesystem, so we MUST redirect Laravel storage/cache to /tmp.
putenv('VIEW_COMPILED_PATH=/tmp/views');
putenv('SESSION_DRIVER=database');
putenv('LOG_CHANNEL=stderr');

if (!is_dir('/tmp/views')) {
    mkdir('/tmp/views', 0777, true);
}

require __DIR__ . '/../public/index.php';
