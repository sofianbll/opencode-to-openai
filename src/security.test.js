import assert from 'node:assert/strict';
import test from 'node:test';

import { buildBackendEnv, normalizeStartProxyOptions, validateProxyConfig } from './proxy.js';
import { normalizeConfig as normalizePluginConfig } from './plugin.js';

test('standalone proxy disables tools and isolates HOME by default', () => {
    const config = normalizeStartProxyOptions({});

    assert.equal(config.DISABLE_TOOLS, true);
    assert.equal(config.USE_ISOLATED_HOME, true);
});

test('plugin disables tools and isolates HOME by default', () => {
    const config = normalizePluginConfig({});

    assert.equal(config.disableTools, true);
    assert.equal(config.useIsolatedHome, true);
});

test('proxy refuses public bind without an API key', () => {
    assert.throws(
        () => validateProxyConfig({ BIND_HOST: '0.0.0.0', API_KEY: '' }),
        /API_KEY is required/i
    );
});

test('backend env filters common secret variables while keeping required runtime values', () => {
    const env = buildBackendEnv({
        sourceEnv: {
            PATH: '/usr/bin',
            HOME: '/real-home',
            NODE_ENV: 'production',
            API_KEY: 'secret',
            OPENAI_API_KEY: 'secret',
            GITHUB_TOKEN: 'secret',
            AWS_SECRET_ACCESS_KEY: 'secret',
            CUSTOM_PASSWORD: 'secret'
        },
        home: '/isolated-home',
        workspace: '/workspace'
    });

    assert.equal(env.PATH, '/usr/bin');
    assert.equal(env.NODE_ENV, 'production');
    assert.equal(env.HOME, '/isolated-home');
    assert.equal(env.USERPROFILE, '/isolated-home');
    assert.equal(env.OPENCODE_PROJECT_DIR, '/workspace');
    assert.equal(env.API_KEY, undefined);
    assert.equal(env.OPENAI_API_KEY, undefined);
    assert.equal(env.GITHUB_TOKEN, undefined);
    assert.equal(env.AWS_SECRET_ACCESS_KEY, undefined);
    assert.equal(env.CUSTOM_PASSWORD, undefined);
});
