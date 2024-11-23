# IRM-egg-server



## QuickStart

<!-- add docs here for user -->

see [egg docs][egg] for more detail.

### Development

```bash
npm i
npm run dev
open http://localhost:7001/
```

### Deploy

```bash
npm start
npm stop
```

### npm scripts

- Use `npm run lint` to check code style.
- Use `npm test` to run unit test.

[egg]: https://eggjs.org

## Docker Setup
### Build the Docker Image
Run the following command to build the Docker image:

```bash
docker build -t node:1.0.0-beta1 .
```

+ -t node:1.0.0-beta1: Specifies the image name as node with the version 1.0.0-beta1.

+ **.** : Uses the current directory as the build context. Ensure that the Dockerfile is located in the project root directory.

### Run the Docker Container
Run the following command to start the container:

```bash
docker run -d -p 7001:7001 \
  --name irm-backend \
  --restart="always" \
  -e DB_HOST=HOSTIP \
  -e DB_USER=root \
  -e DB_PASSWORD=password \
  -e DB_NAME=DBName \
  -e DB_PORT=3306 \
  -e EMAIL_SERVICE=gmail \
  -e EMAIL_USER=your-email@example.com \
  -e EMAIL_PASS=your-email-password \
  -v /root/container/db/logs:/app/logs \
  node:1.0.0-beta1

```