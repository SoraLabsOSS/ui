export const Footer = ({ lastUpdate }: { lastUpdate?: Date }) => (
  <div className="-mt-2 mb-7 flex w-full flex-col-reverse justify-between lg:flex-row lg:items-center lg:gap-2">
    <div className="prose prose-sm flex size-full items-center justify-start text-muted-foreground text-sm">
      <div className="flex items-end">
        <p className="m-0! truncate whitespace-normal text-start">
          Built by{" "}
          <a
            href="https://github.com/axyl1410/"
            rel="noopener noreferrer"
            target="_blank"
          >
            Axyl
          </a>
          . A motion-first component registry for React.
        </p>
        <svg
          aria-hidden="true"
          fill="none"
          height="32"
          style={{ overflow: "visible" }}
          viewBox="0 0 40 40"
          width="32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <style>{`
            .footer-ear-left-sleep, .footer-ear-right-sleep {
              transform-origin: bottom center;
              transform-box: fill-box;
            }
            @keyframes sleepingLeftEar {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(3deg); }
            }
            @keyframes sleepingRightEar {
              0%, 100% { transform: rotate(0deg); }
              50% { transform: rotate(-3deg); }
            }
            .footer-ear-left-sleep { animation: sleepingLeftEar 4s ease-in-out infinite; }
            .footer-ear-right-sleep { animation: sleepingRightEar 4s ease-in-out infinite; }
            @keyframes zFloat1 {
              0% { transform: translate(0, 0) scale(0.7); opacity: 0; }
              10% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translate(4px, -14px) scale(1); opacity: 0; }
            }
            @keyframes zFloat2 {
              0% { transform: translate(0, 0) scale(0.6); opacity: 0; }
              10% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translate(6px, -16px) scale(0.9); opacity: 0; }
            }
            @keyframes zFloat3 {
              0% { transform: translate(0, 0) scale(0.5); opacity: 0; }
              10% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translate(8px, -18px) scale(0.8); opacity: 0; }
            }
          `}</style>
          <g transform="translate(6, 8)">
            <g transform="rotate(-15, 7, 10) translate(0, 1)">
              <path
                className="footer-ear-left-sleep"
                d="M3.738 10.2164L7.224 2.007H9.167L5.676 10.2164H3.738ZM10.791 6.42705C10.791 5.90346 10.726 5.42764 10.596 4.99959C10.47 4.57155 10.292 4.16643 10.063 3.78425C9.833 3.39825 9.56 3.01797 9.243 2.64343C8.926 2.26507 8.767 2.07589 8.767 2.07589L10.24 0.957996C10.24 0.957996 10.433 1.17203 10.819 1.60007C11.209 2.0243 11.559 2.49056 11.869 2.99886C12.178 3.50717 12.413 4.04222 12.574 4.60403C12.734 5.16584 12.814 5.77352 12.814 6.42705C12.814 7.10734 12.73 7.7303 12.562 8.29593C12.394 8.85774 12.153 9.3966 11.84 9.9126C11.526 10.4247 11.181 10.8833 10.802 11.2884C10.428 11.6974 10.24 11.9018 10.24 11.9018L8.767 10.7839C8.767 10.7839 8.924 10.5948 9.237 10.2164C9.554 9.8419 9.83 9.4597 10.063 9.06985C10.3 8.6762 10.479 8.26726 10.602 7.84304C10.728 7.41499 10.791 6.943 10.791 6.42705Z"
                fill="currentColor"
              />
            </g>
            <g transform="rotate(15, 19, 10) translate(0, 1)">
              <path
                className="footer-ear-right-sleep"
                d="M15.003 10.2164L18.489 2.007H20.432L16.941 10.2164H15.003ZM22.056 6.42705C22.056 5.90346 21.991 5.42764 21.861 4.99959C21.735 4.57155 21.557 4.16643 21.328 3.78425C21.098 3.39825 20.825 3.01797 20.508 2.64343C20.191 2.26507 20.032 2.07589 20.032 2.07589L21.505 0.957996C21.505 0.957996 21.698 1.17203 22.084 1.60007C22.474 2.0243 22.824 2.49056 23.133 2.99886C23.443 3.50717 23.678 4.04222 23.839 4.60403C23.999 5.16584 24.079 5.77352 24.079 6.42705C24.079 7.10734 23.995 7.7303 23.827 8.29593C23.659 8.85774 23.418 9.3966 23.105 9.9126C22.791 10.4247 22.445 10.8833 22.067 11.2884C21.693 11.6974 21.505 11.9018 21.505 11.9018L20.032 10.7839C20.032 10.7839 20.189 10.5948 20.502 10.2164C20.819 9.8419 21.094 9.4597 21.328 9.06985C21.565 8.6762 21.744 8.26726 21.866 7.84304C21.993 7.41499 22.056 6.943 22.056 6.42705Z"
                fill="currentColor"
              />
            </g>
            <path
              d="M2.03 20.4328C2.03 20.9564 2.093 21.4322 2.219 21.8602C2.345 22.2883 2.523 22.6953 2.752 23.0813C2.981 23.4635 3.254 23.8419 3.572 24.2164C3.889 24.5948 4.047 24.7839 4.047 24.7839L2.574 25.9018C2.574 25.9018 2.379 25.6878 1.989 25.2598C1.603 24.8355 1.256 24.3693 0.946 23.861C0.636 23.3527 0.401 22.8176 0.241 22.2558C0.08 21.694 0 21.0863 0 20.4328C0 19.7525 0.084 19.1314 0.252 18.5696C0.421 18.004 0.661 17.4651 0.975 16.953C1.288 16.4371 1.632 15.9765 2.007 15.5714C2.385 15.1625 2.574 14.958 2.574 14.958L4.047 16.0759C4.047 16.0759 3.889 16.2651 3.572 16.6434C3.258 17.018 2.983 17.4021 2.746 17.7957C2.513 18.1855 2.335 18.5945 2.213 19.0225C2.091 19.4467 2.03 19.9168 2.03 20.4328ZM23.687 20.4271C23.687 19.9035 23.622 19.4276 23.492 18.9996C23.366 18.5715 23.188 18.1664 22.959 17.7843C22.729 17.3982 22.456 17.018 22.139 16.6434C21.822 16.2651 21.663 16.0759 21.663 16.0759L23.136 14.958C23.136 14.958 23.329 15.172 23.715 15.6001C24.105 16.0243 24.455 16.4906 24.765 16.9989C25.074 17.5072 25.309 18.0422 25.47 18.604C25.63 19.1658 25.71 19.7735 25.71 20.4271C25.71 21.1073 25.626 21.7303 25.458 22.2959C25.29 22.8577 25.049 23.3966 24.736 23.9126C24.422 24.4247 24.077 24.8833 23.698 25.2884C23.324 25.6974 23.136 25.9018 23.136 25.9018L21.663 24.7839C21.663 24.7839 21.82 24.5948 22.133 24.2164C22.45 23.8419 22.726 23.4597 22.959 23.0698C23.196 22.6762 23.375 22.2673 23.498 21.843C23.624 21.415 23.687 20.943 23.687 20.4271Z"
              fill="currentColor"
            />
            <rect
              fill="currentColor"
              height="1.4"
              rx="0.7"
              ry="0.7"
              width="5"
              x="5.777"
              y="19.766"
            />
            <rect
              fill="currentColor"
              height="1.4"
              rx="0.7"
              ry="0.7"
              width="5"
              x="17.378"
              y="19.766"
            />
          </g>
          <g
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g
              strokeWidth="1.5"
              style={{
                animation:
                  "3s ease-out 0s infinite normal both running zFloat1",
              }}
            >
              <path d="M32 5 L36 5 L32 9 L36 9" />
            </g>
            <g
              strokeWidth="1.3"
              style={{
                animation:
                  "3s ease-out 1s infinite normal both running zFloat2",
              }}
            >
              <path d="M34 3 L37 3 L34 6 L37 6" />
            </g>
            <g
              strokeWidth="1.1"
              style={{
                animation:
                  "3s ease-out 2s infinite normal both running zFloat3",
              }}
            >
              <path d="M36 1 L38.5 1 L36 3.5 L38.5 3.5" />
            </g>
          </g>
        </svg>
      </div>
    </div>

    {lastUpdate && (
      <p className="flex items-center gap-1 text-nowrap text-muted-foreground text-sm">
        Last updated:{" "}
        <span className="rounded-sm bg-accent px-1.5 py-0.75 font-medium text-[13px] text-foreground">
          {lastUpdate?.toLocaleDateString()}
        </span>
      </p>
    )}
  </div>
);
