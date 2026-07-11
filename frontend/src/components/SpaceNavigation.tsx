/**
 * SpaceNavigation.tsx
 * WASD + mouse navigation for 3D space
 */
import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

export interface SpaceNavigationProps {
  movementMode?: 'free' | 'orbit' | 'firstPerson' | 'thirdPerson' | 'fly';
  speed?: number;
}

const SpaceNavigation = ({ speed = 5 }: SpaceNavigationProps) => {
  const { camera } = useThree();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const moveSpeed = speed * 0.1;
      switch (e.key.toLowerCase()) {
        case 'w': camera.position.z -= moveSpeed; break;
        case 'a': camera.position.x -= moveSpeed; break;
        case 's': camera.position.z += moveSpeed; break;
        case 'd': camera.position.x += moveSpeed; break;
      }
      camera.lookAt(0, 0, 0);
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [speed, camera]);

  return null;
};

export default SpaceNavigation;
