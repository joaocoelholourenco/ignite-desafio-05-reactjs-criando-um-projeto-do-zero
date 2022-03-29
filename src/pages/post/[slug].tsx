import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText, RichTextBlock } from 'prismic-reactjs';
import * as Prismic from '@prismicio/client';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { useRouter } from 'next/router';
import Header from '../../components/Header';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  function readingTime(): number {
    const regexPattern = /[^\w]/;

    const word = String(
      post.data.content.reduce((acc, element) => {
        const body = RichText.asText(element?.body);

        return acc + body + element?.heading;
      }, 0)
    );

    return Math.ceil(word.split(regexPattern).length / 200);
  }

  return (
    <>
      <Header />

      {post ? (
        <>
          <div className={styles.containerImage}>
            <img src={post.data.banner.url} alt="" />
          </div>
          <main className={styles.container}>
            <div className={styles.content}>
              <h1>{post.data.title}</h1>
              <div className={commonStyles.info}>
                <div>
                  <FiCalendar />
                  <span>
                    {format(new Date(post.first_publication_date), 'dd MMM y', {
                      locale: ptBR,
                    })}
                  </span>
                </div>
                <div>
                  <FiUser />
                  <span>{post.data.author}</span>
                </div>
                <div>
                  <FiClock />
                  <span>{readingTime()} min</span>
                </div>
              </div>
              <section className={styles.contentPost}>
                {post.data.content.map(element => (
                  <div key={(Math.random() * 9999999).toString()}>
                    <h2>{element.heading}</h2>
                    <p>
                      <RichText render={element.body} />
                    </p>
                  </div>
                ))}
              </section>
            </div>
          </main>
        </>
      ) : (
        <p>Carregando...</p>
      )}
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {}
  );

  const slugsParams = postsResponse.results.map(result => {
    return {
      params: {
        slug: result.uid,
      },
    };
  });

  return {
    paths: slugsParams,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();

  const postResponse = await prismic.getByUID('posts', String(params.slug));

  return {
    props: {
      post: postResponse,
    },
  };
};
