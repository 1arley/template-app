import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
    getHealth() {
        return {
            message: 'SeedaBit NestJS Template API',
            version: '1.0.0',
            timestamp: new Date().toISOString(),
        }
    }
}
