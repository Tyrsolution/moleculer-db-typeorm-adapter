# Introduction

[![NPM](https://img.shields.io/npm/v/@tyrsolutions/moleculer-db-typeorm-adapter.svg?style=flat-square)](https://www.npmjs.com/package/@tyrsolutions/moleculer-db-typeorm-adapter)
<!-- [![GitHub Workflow Status (main)](https://img.shields.io/github/workflow/status/yrsolution/moleculer-db-typeorm-adapter/Build/main?label=checks&style=flat-square)](https://github.com/tyrsolution/moleculer-db-typeorm-adapter/actions?query=branch%3Amain+) -->
<!-- [![Codacy grade](https://img.shields.io/codacy/grade/39220ba530f24dfc9443b47f2efea5c9?style=flat-square)](https://app.codacy.com/gh/jhildenbiddle/docsify-themeable/dashboard) -->
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://github.com/Tyrsolution/moleculer-db-typeorm-adapter/blob/master/LICENSE)
[![jsDelivr](https://data.jsdelivr.com/v1/package/npm/@tyrsolutions/moleculer-db-typeorm-adapter/badge)](https://www.jsdelivr.com/package/npm/@tyrsolutions/moleculer-db-typeorm-adapter)
<!-- [![Sponsor this project](https://img.shields.io/static/v1?style=flat-square&label=Sponsor&message=%E2%9D%A4&logo=GitHub&color=%23fe8e86)](https://github.com/sponsors/jhildenbiddle) -->
[![Add a star on GitHub](https://img.shields.io/github/stars/Tyrsolution/moleculer-db-typeorm-adapter?style=social)](https://github.com/Tyrsolution/moleculer-db-typeorm-adapter)
<!-- [![Tweet](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fjhildenbiddle%2Fdocsify-themeable&hashtags=css,docsify,developers,frontend) -->

## Features

- **Connect to the most common database systems**<br>
  Connect moleculer to the most common database systems: MySQL, MariaDB, PostgreSQL, CockroachDB, SQLite, Microsoft SQL Server, sql.js, Oracle, @sap/Hana, Google Cloud Spanner, and MongoDB. Or connect to multiple database systems in a single service.

- **Active Record, Data Mapping, or use a combination of the two. It's your choice**<br>
  This adapter supports Active Record by default. When a connection is created with one or more entities, these entities are mapped to the connection for ease of use. No need to use ```getRepository(<Entity>)``` to query additional tables in a database, just use ```connection.<Entity>``` for additional entities and ```connection``` for the primary entity of the service. The primary entity is based on the entity being the first entity of the data source entities array. Any entity methods added within the entity are surfaced and mapped as well.
  Repository and EntityManager are mappes as well if the preference is data mapping or additional features of TypeORM needed or required.

- **Connection Manager**<br>
  Manage your database connections with ease using the connection manager. The connection manager is a per service conneciton manager, so each service can hold and manage its own connections to databases. Configured connections start and stop with the service, so no need to close connections on service restart or collisions with connection names from other services.

- **Database ID field transformation**<br>
  No matter what your project uses internally for ID, the correct primary ID is used to query the database. As long as your entity schema primary ID matches the database table primary ID there should never be an issue saving or retreiveing your data.

<!-- - **Legacy browser support (IE11+)**<br>
  Thoroughly tested and fully compatible with legacy browsers, including support for CSS custom properties (courtesy of a handy [ponyfill](https://github.com/jhildenbiddle/css-vars-ponyfill) developed specifically for docsify-themeable). -->

?> Like moleculer-db-typeorm-adapter? Be sure to check out our other projects for moleculer: [moleculer-decorators-extended](https://github.com/ourparentcenter/moleculer-decorators-extended) for moleculer decorators and [moleculer-template-project-ts-swagger](https://github.com/ourparentcenter/moleculer-template-project-ts-swagger) for moleculer typescript project starter!

## Sponsorship

A [sponsorship](https://github.com/sponsors/Karnith) is more than just a way to show appreciation for the open-source authors and projects we rely on; it can be the spark that ignites the next big idea, the inspiration to create something new, and the motivation to share so that others may benefit.

If you benefit from this project, please consider lending your support and encouraging future efforts by [becoming a sponsor](https://github.com/sponsors/Karnith).

Thank you! 🙏🏻

<iframe src="https://github.com/sponsors/Karnith/button" title="Sponsor Karnith" height="32" width="114" style="border: 0; border-radius: 6px;"></iframe>

## Contact & Support

- Follow 👨🏻‍💻 [GitHub](https://github.com/Karnith) for announcements
- Create a 💬 [GitHub issue](https://github.com/Tyrsolution/moleculer-db-typeorm-adapter/issues) for bug reports, feature requests, or questions
- Add a ⭐️ [star on GitHub](https://github.com/Tyrsolution/moleculer-db-typeorm-adapter) to promote the project
- Become a 💖 [sponsor](https://github.com/sponsors/Karnith) to support the project and future efforts

## License

This project is licensed under the [MIT license](https://github.com/Tyrsolution/moleculer-db-typeorm-adapter/blob/master/LICENSE).

Copyright (c) Tyr Solutions
