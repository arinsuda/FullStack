import { DriveConfig } from '@ioc:Adonis/Core/Drive'

const driveConfig: DriveConfig = {
  disks: {
    local: {
      driver: 'local',
      visibility: 'public', // ทำให้ไฟล์ที่เก็บในที่นี้สามารถเข้าถึงได้จากภายนอก
      root: './storage', // โฟลเดอร์ที่ใช้เก็บไฟล์
    },
    // คุณสามารถเพิ่ม disk สำหรับบริการอื่นๆ เช่น S3 ได้
  },
}

export default driveConfig
