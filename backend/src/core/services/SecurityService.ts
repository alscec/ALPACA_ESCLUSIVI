import { injectable } from "tsyringe";
// Note: In production, install 'bcryptjs' via npm: npm install bcryptjs @types/bcryptjs
// import * as bcrypt from 'bcryptjs';

@injectable()
export class SecurityService {
  
  /**
   * Hashes a plain text password using bcrypt.
   * @param plainText The user's input password.
   */
  async hashPassword(plainText: string): Promise<string> {
    // SIMULATION FOR SKELETON:
    // return await bcrypt.hash(plainText, 10);
    
    // TEMPORARY SIMULATION (Remove in Production):
    return `hashed_${plainText}_${Date.now()}`; 
  }

  /**
   * Verifies a plain text password against a hash.
   * @param plainText Input password
   * @param hash Stored hash
   */
  async verifyPassword(plainText: string, hash: string): Promise<boolean> {
    // SIMULATION FOR SKELETON:
    // return await bcrypt.compare(plainText, hash);

    // TEMPORARY SIMULATION:
    return hash.startsWith(`hashed_${plainText}`);
  }
}