# Evolutionflow Manager App

관리자 전용 앱입니다. 배포 대상 도메인: `manager.evolutionflowglobal.com`

## Run

```bash
yarn install
yarn dev
```

## Environment

`.env.local` 파일을 만들고 아래를 설정하세요.

```bash
NEXT_PUBLIC_API_URL=https://api.evolutionflowglobal.com/api
```

## Notes
- `/` 진입 시 `/admin`으로 리다이렉트됩니다.
- 인증되지 않은 경우 `/login`으로 이동합니다.
