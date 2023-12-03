![Logo](https://repository-images.githubusercontent.com/726691357/f09bf6fc-3844-4584-8eee-6bfb425d8a38)

# @svelte-dev/auth

[![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin) [![npm](https://img.shields.io/npm/v/@svelte-dev/auth.svg)](https://npmjs.org/package/@svelte-dev/auth) [![npm](https://img.shields.io/npm/dm/@svelte-dev/auth.svg)](https://npmjs.org/package/@svelte-dev/auth) [![npm](https://img.shields.io/npm/dt/@svelte-dev/auth.svg)](https://npmjs.org/package/@svelte-dev/auth) [![Maintainability](https://api.codeclimate.com/v1/badges/c6bf9a8943f6040ff00b/maintainability)](https://codeclimate.com/github/willin/svelte-auth/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/c6bf9a8943f6040ff00b/test_coverage)](https://codeclimate.com/github/willin/svelte-auth/test_coverage)

Simple Authentication for [Svlelte](https://svelte.dev/).

## Features

- Full **Server-Side** Authentication
- Complete **TypeScript** Support
- **Strategy**-based Authentication
- Easily handle **success and failure**
- Implement **custom** strategies
- Supports persistent **sessions**

## Overview

Svelte Auth is a complete open-source authentication solution for Svelte applications.

Heavily inspired by [Passport.js](https://passportjs.org) and [Remix-Auth](https://github.com/sergiodxa/remix-auth), but completely rewrote it from scratch to work on top of the [Web Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API). Svelte Auth can be dropped in to any Svelte-based application with minimal setup.

As with Passport.js, it uses the strategy pattern to support the different authentication flows. Each strategy is published individually as a separate npm package.

## Installation

To use it, install it from npm (yarn or bun):

```bash
npm install @svelte-dev/auth
```

## Usage

## Advanced Usage

### Custom redirect URL based on the user

### Changing the session key

### Reading authentication errors

### Errors Handling

## 赞助 Sponsor

维护者 Owner： [Willin Wang](https://willin.wang)

如果您对本项目感兴趣，可以通过以下方式支持我：

- 关注我的 Github 账号：[@willin](https://github.com/willin) [![github](https://img.shields.io/github/followers/willin.svg?style=social&label=Followers)](https://github.com/willin)
- 参与 [爱发电](https://afdian.net/@willin) 计划
- 支付宝或微信[扫码打赏](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

Donation ways:

- Github: <https://github.com/sponsors/willin>
- Paypal: <https://paypal.me/willinwang>
- Alipay or Wechat Pay: [QRCode](https://user-images.githubusercontent.com/1890238/89126156-0f3eeb80-d516-11ea-9046-5a3a5d59b86b.png)

## 许可证 License

Apache-2.0
