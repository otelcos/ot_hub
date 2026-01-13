import React from 'react';
import Footer from '@theme-original/Footer';
import type FooterType from '@theme/Footer';
import type { WrapperProps } from '@docusaurus/types';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

type Props = WrapperProps<typeof FooterType>;

export default function FooterWrapper(props: Props): JSX.Element {
  const logoSrc = useBaseUrl('/img/GSMA-Logo-Red-RGB.png');

  return (
    <div className={styles.footerWrapper}>
      <Footer {...props} />
      <div className={styles.gsmaLogo}>
        <a
          href="https://www.gsma.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GSMA"
        >
          <img src={logoSrc} alt="GSMA" />
        </a>
      </div>
    </div>
  );
}
